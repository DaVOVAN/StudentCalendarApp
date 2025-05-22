// src/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';


declare module 'axios' {
  interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}

const getUserFromToken = (accessToken: string) => {
  try {
    const decoded = jwtDecode<{
      userId?: string;
      sub?: string; 
      username?: string;
      is_guest?: boolean;
    }>(accessToken);

    return {
      id: decoded.userId || decoded.sub || 'unknown',
      displayName: decoded.username || 'Гость',
      isGuest: decoded.is_guest || false
    };
  } catch (error) {
    console.error('JWT decode error:', error);
    return {
      id: 'guest-fallback',
      displayName: 'Гость',
      isGuest: true
    };
  }
};

const api = axios.create({
  baseURL: process.env.API_URL || 'http://46.146.235.134:3000/api',
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const accessToken = await AsyncStorage.getItem('@access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest?._retry) {
      try {
        originalRequest._retry = true;
        const refreshToken = await AsyncStorage.getItem('@refresh_token');
        
        if (!refreshToken) {
          throw new Error('RefreshTokenMissing');
        }

        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`, 
          { refreshToken },
          { 
            headers: { 
              'X-Request-Source': 'refresh-token',
              'Authorization': ''
            } 
          }
        );

        if (!refreshResponse.data?.accessToken) {
          throw new Error('Invalid server response');
        }

        const user = await getUserFromToken(refreshResponse.data.accessToken);
        
        await AsyncStorage.multiSet([
          ['@access_token', refreshResponse.data.accessToken],
          ['@refresh_token', refreshToken],
          ['@user', JSON.stringify(user)]
        ]);

        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError: unknown) {
        let errorMessage = 'Unknown error';
        if (refreshError instanceof Error) {
          errorMessage = refreshError.message;
          console.error('Ошибка обновления токена:', {
            message: errorMessage,
            stack: refreshError.stack
          });
        }
        
        await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
        window.location.reload();
        return Promise.reject(new Error(errorMessage));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;