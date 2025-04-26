//src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from '../types/types';

const CALENDARS_KEY = '@calendars';

export const loadCalendars = async (): Promise<Calendar[]> => {
  try {
    const stored = await AsyncStorage.getItem(CALENDARS_KEY);
    return stored ? (JSON.parse(stored) as Calendar[]) : [];
  } catch (error) {
    console.error('Failed to load calendars:', error);
    return [];
  }
};

export const saveCalendars = async (calendars: Calendar[]) => {
  try {
    await AsyncStorage.setItem(CALENDARS_KEY, JSON.stringify(calendars));
  } catch (error) {
    console.error('Failed to save calendars:', error);
  }
};