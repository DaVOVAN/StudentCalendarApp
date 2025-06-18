// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api from '../api/client';

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
      
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
      throw new Error('Ошибка сохранения данных аутентификации');
    }
  };

  const getUserFromToken = async (accessToken: string): Promise<User> => {
    const decoded: any = jwtDecode(accessToken);
    return {
      id: decoded.sub,
      displayName: decoded.displayName || decoded.username || 'Гость',
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

      if (refreshToken[1]) {
        try {
          const decoded = jwtDecode<{ exp?: number }>(refreshToken[1]);
          if (decoded.exp && decoded.exp * 1000 > Date.now()) {
            const response = await api.post('/auth/refresh', { 
              refreshToken: refreshToken[1] 
            });
            
            await AsyncStorage.multiSet([
              ['@access_token', response.data.accessToken],
              ['@refresh_token', response.data.refreshToken],
              ['@user', JSON.stringify(response.data.user)]
            ]);
            
            setUser(response.data.user);
            return;
          }
        } catch (error) {
          console.log('Refresh failed:', error);
        }
      }

      const guestResponse = await api.post('/auth/guest');
      await AsyncStorage.multiSet([
        ['@access_token', guestResponse.data.accessToken],
        ['@refresh_token', guestResponse.data.refreshToken],
        ['@user', JSON.stringify(guestResponse.data.user)]
      ]);
      setUser(guestResponse.data.user);
      
    } catch (error) {
      console.log('Auth init error:', error);
      const fallbackResponse = await api.post('/auth/guest');
      await AsyncStorage.multiSet([
        ['@access_token', fallbackResponse.data.accessToken],
        ['@refresh_token', fallbackResponse.data.refreshToken],
        ['@user', JSON.stringify(fallbackResponse.data.user)]
      ]);
      setUser(fallbackResponse.data.user);
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
    } catch (error) {
      console.log('Ошибка выхода:', error);
    } finally {
      await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
      await createGuestSession();
    }
  };

  const refreshSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      
      if (!refreshToken) {
        throw new Error('RefreshTokenMissing');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (!response.data.accessToken || !response.data.refreshToken) {
        throw new Error('InvalidTokenResponse');
      }

      const user = await getUserFromToken(response.data.accessToken);
      
      await AsyncStorage.multiSet([
        ['@access_token', response.data.accessToken],
        ['@refresh_token', response.data.refreshToken],
        ['@user', JSON.stringify(user)]
      ]);

      return response.data;

    } catch (error) {
      await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
      const guestResponse = await api.post('/auth/guest');
      await AsyncStorage.multiSet([
        ['@access_token', guestResponse.data.accessToken],
        ['@refresh_token', guestResponse.data.refreshToken],
        ['@user', JSON.stringify(guestResponse.data.user)]
      ]);
      throw error;
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const [accessToken, refreshToken] = await AsyncStorage.multiGet([
          '@access_token', 
          '@refresh_token'
        ]);

        if (!accessToken[1] || !refreshToken[1]) return;

        const decodedAccess = jwtDecode<{ exp?: number }>(accessToken[1]);
        const decodedRefresh = jwtDecode<{ exp?: number }>(refreshToken[1]);

        if (decodedRefresh.exp && decodedRefresh.exp * 1000 < Date.now()) {
          await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
          await createGuestSession();
          return;
        }

        if (decodedAccess.exp && decodedAccess.exp * 1000 < Date.now() + 300000) {
          await refreshSession();
        }
      } catch (error) {
        console.log('Token check error:', error);
        await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
        await createGuestSession();
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