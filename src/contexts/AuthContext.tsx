// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { Alert } from 'react-native';
import axios from 'axios';

interface User {
  id: string;
  username?: string;
  displayName: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      const [accessToken, refreshToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('@access_token'),
        AsyncStorage.getItem('@refresh_token'),
        AsyncStorage.getItem('@user'),
      ]);

      console.log('[AUTH INIT] Stored tokens:', { 
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        user: storedUser 
      });

      if (refreshToken) {
        try {
          // Проверяем валидность refresh token
          const response = await axios.post(
            'http://46.146.235.134:3000/api/auth/refresh',
            { refreshToken }
          );
          
          await AsyncStorage.multiSet([
            ['@access_token', response.data.accessToken],
            ['@refresh_token', response.data.refreshToken]
          ]);
          
          console.log('[AUTH INIT] Tokens refreshed successfully');
          const userData = JSON.parse(storedUser || '{}');
          setUser(userData);
        } catch (refreshError) {
          console.log('[AUTH INIT] Refresh failed, creating guest session');
          await createGuestSession();
        }
      } else {
        console.log('[AUTH INIT] No tokens, creating guest session');
        await createGuestSession();
      }
    } catch (error) {
      console.error('[AUTH INIT] Critical error:', error);
      await createGuestSession();
    } finally {
      setIsLoading(false);
    }
  };

  const createGuestSession = async () => {
    try {
      const response = await api.post('/auth/guest');
      await storeAuthData({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Ошибка создания гостя:', error);
      Alert.alert('Ошибка', 'Не удалось создать гостевую сессию');
    }
  };

  const login = async (username: string, password: string) => {
  try {
    await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
    
    const response = await api.post('/auth/login', { username, password });
    await storeAuthData(response.data);
    setUser(response.data.user);
  } catch (error) {
    throw error;
  }
};

const register = async (username: string, password: string) => {
  try {
    await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
    
    const response = await api.post('/auth/register', { username, password });
    await storeAuthData(response.data);
    setUser(response.data.user);
  } catch (error) {
    throw error;
  }
};

  const logout = async () => {
  try {
    await api.post('/auth/logout');
    await AsyncStorage.multiRemove([
      '@access_token',
      '@refresh_token',
      '@user',
      '@calendars'
    ]);
    await createGuestSession();
  } catch (error) {
    console.error('Ошибка выхода:', error);
  }
};

  const refreshSession = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      const response = await api.post('/auth/refresh', { refreshToken });
      await storeAuthData(response.data);
    } catch (error) {
      await logout();
    }
  };

  const storeAuthData = async (data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => {
    await AsyncStorage.multiSet([
      ['@access_token', data.accessToken],
      ['@refresh_token', data.refreshToken],
      ['@user', JSON.stringify(data.user)],
    ]);
  };

  useEffect(() => {
    initAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);