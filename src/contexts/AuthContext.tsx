// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { Alert } from 'react-native';

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
      const [accessToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('@access_token'),
        AsyncStorage.getItem('@user'),
      ]);

      if (accessToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else {
        await createGuestSession();
      }
    } catch (error) {
      console.error('Auth init error:', error);
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
      const response = await api.post('/auth/login', { username, password });
      await storeAuthData(response.data);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
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
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
      await createGuestSession();
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