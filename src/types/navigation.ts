// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Calendar: { calendarId: string };
  EventList: { calendarId: string; selectedDate: string };
  ViewEvent: { calendarId: string; eventId: string };
  AddEvent: { calendarId: string; selectedDate: string };
  ThemeSelection: undefined;
};