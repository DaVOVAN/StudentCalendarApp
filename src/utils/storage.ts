//src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from '../types/types';

const CALENDARS_KEY = '@calendars';

export const loadCalendars = async (): Promise<Calendar[]> => {
  try {
    const stored = await AsyncStorage.getItem(CALENDARS_KEY);
    if (!stored) {
      return [];
    }

    try {
      const parsedCalendars = JSON.parse(stored) as Calendar[];
      return parsedCalendars;
    } catch (parseError) {
      console.error('Failed to parse calendars from storage:', parseError);
      return [];
    }

  } catch (error) {
    console.error('Failed to load calendars:', error);
    return [];
  }
};

export const saveCalendars = async (calendars: Calendar[]) => {
  try {
    const serializedCalendars = JSON.stringify(calendars);
    await AsyncStorage.setItem(CALENDARS_KEY, serializedCalendars);
  } catch (error) {
    console.error('Failed to save calendars:', error);
  }
};