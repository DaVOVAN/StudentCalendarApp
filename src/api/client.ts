// src/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://46.146.235.134:3000/api',
});

declare module 'axios' {
  interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}

api.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem('@access_token');
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Добавляем логирование ошибки
    console.log('[AXIOS INTERCEPTOR] Error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      authHeader: originalRequest?.headers?.Authorization
    });

    if (error.response?.status === 401 && !originalRequest?._retry) {
      try {
        console.log('[AXIOS INTERCEPTOR] Attempting token refresh...');
        originalRequest!._retry = true;
        
        const refreshToken = await AsyncStorage.getItem('@refresh_token');
        if (!refreshToken) {
          console.log('[AXIOS INTERCEPTOR] No refresh token found');
          throw new Error('Refresh token not found');
        }

        // Явно указываем полный URL для refresh-запроса
        const refreshResponse = await axios.post(
          'http://46.146.235.134:3000/api/auth/refresh',
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log('[AXIOS INTERCEPTOR] Refresh response:', refreshResponse.data);
        
        await AsyncStorage.multiSet([
          ['@access_token', refreshResponse.data.accessToken],
          ['@refresh_token', refreshResponse.data.refreshToken]
        ]);

        // Обновляем headers в существующем экземпляре axios
        api.defaults.headers.common.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
        
        // Клонируем оригинальный запрос с обновленным header
        const newRequest = {
          ...originalRequest,
          headers: {
            ...originalRequest?.headers,
            Authorization: `Bearer ${refreshResponse.data.accessToken}`
          }
        };

        return api(newRequest);
      } catch (refreshError) {
        console.error('[AXIOS INTERCEPTOR] Refresh failed:', refreshError);
        await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
        Alert.alert('Сессия истекла', 'Пожалуйста, войдите снова');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;