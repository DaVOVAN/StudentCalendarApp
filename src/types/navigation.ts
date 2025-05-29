// src/types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import { CalendarEvent } from './types';

export type RootStackParamList = {
  Home: undefined;
  Calendar: { calendarId: string };
  EventList: { 
    calendarId: string;
    selectedDate: string;
    validatedDate?: string;
  };
  ViewEvent: { calendarId: string; eventId: string };
  AddEvent: { 
    calendarId?: string;
    selectedDate?: string;
    isShared?: boolean;
    eventId?: string;
    isEdit?: boolean;
    initialData?: Partial<CalendarEvent>;
  };
  ThemeSelection: undefined;
  CalendarMembers: { calendarId: string };
  CalendarSettings: { calendarId: string };
};

export type MainTabParamList = {
  Calendars: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}