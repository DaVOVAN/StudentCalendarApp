// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api from '../api/client';
import axios from 'axios';

interface User {
  id: string;
  displayName: string;
  isGuest: boolean;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isInitializing: boolean;
  createGuestSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const storeAuthData = async (responseData: { 
    accessToken: string; 
    refreshToken: string; 
    user?: User 
  }) => {
    try {
      if (!responseData.accessToken || !responseData.refreshToken) {
        throw new Error('Отсутствуют токены в ответе сервера');
      }

      const userData = responseData.user || await getUserFromToken(responseData.accessToken);
      
      await AsyncStorage.multiSet([
        ['@access_token', responseData.accessToken],
        ['@refresh_token', responseData.refreshToken],
        ['@user', JSON.stringify(userData)]
      ]);
      
      setUser(userData);
      
      console.log('Данные аутентификации успешно сохранены');
    } catch (error) {
      console.error('Ошибка сохранения данных:', {
        error,
        responseData: {
          accessToken: responseData?.accessToken?.slice(0, 10) + '...',
          refreshToken: responseData?.refreshToken?.slice(0, 10) + '...',
          user: responseData?.user
        }
      });
      throw new Error('Ошибка сохранения данных аутентификации');
    }
  };

  const getUserFromToken = async (accessToken: string): Promise<User> => {
    const decoded: any = jwtDecode(accessToken);
    return {
      id: decoded.sub,
      displayName: decoded.username || 'Гость',
      isGuest: decoded.is_guest || false
    };
  };

  const createGuestSession = async () => {
    try {
      await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
      
      const response = await api.post('/auth/guest', {}, {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'guest-init'
        }
      });
      
      await storeAuthData(response.data);
    } catch (error) {
      console.log('Фатальная ошибка создания гостя:', error);
      Alert.alert('Ошибка', 'Не удалось инициализировать приложение');
    }
  };

  const initAuth = async () => {
    try {
      const [accessToken, refreshToken] = await AsyncStorage.multiGet([
        '@access_token',
        '@refresh_token'
      ]);

      if (!refreshToken[1]) {
        return await createGuestSession();
      }

      try {
        jwtDecode(accessToken[1]!);
      } catch {
        const response = await api.post('/auth/refresh', { refreshToken: refreshToken[1] }, {
          headers: {
            'X-Request-Source': 'refresh-token'
          }
        });
        
        await storeAuthData(response.data);
        return;
      }

      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

    } catch (error) {
      console.log('Ошибка инициализации:', error);
      await createGuestSession();
    } finally {
      setIsInitializing(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      await storeAuthData(response.data);
    } catch (error) {
      throw new Error('Неверные учетные данные');
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, password });
      await storeAuthData(response.data);
    } catch (error) {
      throw new Error('Ошибка регистрации');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      const guestResponse = await api.post('/auth/guest');
      await storeAuthData(guestResponse.data);
    } catch (error) {
      console.log('Ошибка выхода:', error);
      await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
    }
  };

  const refreshSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      
      if (!refreshToken) {
        await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
        return createGuestSession();
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      await storeAuthData(response.data);
    } catch (error) {
      console.log('Ошибка обновления токена:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
          await createGuestSession();
        }
      }
      
      throw error;
    }
  };

  useEffect(() => {
    initAuth();
  }, []);
  
  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('@access_token');
        if (!accessToken) return;

        const decoded = jwtDecode<{ exp?: number }>(accessToken);
        if (!decoded.exp) {
          console.log('Токен не содержит срока действия');
          await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
          return;
        }

        if (decoded.exp * 1000 < Date.now() + 60000) { 
          await refreshSession();
        }
      } catch (error) {
        console.log('Ошибка проверки токена:', error);
        await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [refreshSession]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      refreshSession,
      createGuestSession,
      isInitializing
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};