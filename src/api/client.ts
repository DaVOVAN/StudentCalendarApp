// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://46.146.235.134:3000/api',
});

api.interceptors.request.use(async (config) => {
  const accessToken = await AsyncStorage.getItem('@access_token');
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('@refresh_token');
        const response = await axios.post('/auth/refresh', { refreshToken });
        
        await AsyncStorage.setItem('@access_token', response.data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['@access_token', '@refresh_token', '@user']);
        Alert.alert('Сессия истекла', 'Пожалуйста, войдите снова');
        return Promise.reject(refreshError);
      }
    }
    
    const message = error.response?.data?.message || 'Ошибка сети';
    Alert.alert('Ошибка', message);
    return Promise.reject(error);
  }
);

export default api;