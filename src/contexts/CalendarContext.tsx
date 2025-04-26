//src/contexts/CalendarContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Calendar, Event } from '../types/types';
import { loadCalendars, saveCalendars } from '../utils/storage';

interface CalendarContextType {
  calendars: Calendar[];
  addCalendar: (name: string) => void;
  addEvent: (calendarId: string, event: Omit<Event, 'id'>) => void;
}

const CalendarContext = createContext<CalendarContextType>({} as CalendarContextType);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);

  useEffect(() => {
    const initializeCalendars = async () => {
      try {
        const loadedCalendars = await loadCalendars();
        setCalendars(loadedCalendars);
      } catch (error) {
        console.error("Failed to initialize calendars:", error);
        // Handle error appropriately (e.g., display an error message)
      }
    };

    initializeCalendars();
  }, []);

  const addCalendar = (name: string) => {
    const newCalendar: Calendar = {
      id: Date.now().toString(),
      name,
      color: '#007AFF', // Можно вынести цвет в константу или настройки темы
      events: [],
    };

    setCalendars(prevCalendars => {
      const updatedCalendars = [...prevCalendars, newCalendar];
      saveCalendars(updatedCalendars);
      return updatedCalendars;
    });
  };

  const addEvent = (calendarId: string, event: Omit<Event, 'id'>) => {
    setCalendars(prevCalendars => {
      const updatedCalendars = prevCalendars.map(calendar => {
        if (calendar.id === calendarId) {
          const newEvent: Event = { ...event, id: Date.now().toString() };
          return {
            ...calendar,
            events: [...calendar.events, newEvent],
          };
        }
        return calendar;
      });
      saveCalendars(updatedCalendars);
      return updatedCalendars;
    });
  };

  const contextValue: CalendarContextType = {
    calendars,
    addCalendar,
    addEvent,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
