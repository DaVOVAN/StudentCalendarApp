// src/types/navigation.ts
export type RootStackParamList = {
    Home: undefined;
    Calendar: { calendarId: string };
    EventList: { calendarId: string; selectedDate: string };  // added EventList
  };