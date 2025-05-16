// src/types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';

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
    isShared?: boolean 
  };
  ThemeSelection: undefined;
  CalendarMembers: { calendarId: string };
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