// src/contexts/CalendarContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Calendar, CalendarEvent } from '../types/types';
import { loadCalendars, saveCalendars } from '../utils/storage';

interface CalendarContextType {
    calendars: Calendar[];
    addCalendar: (name: string) => void;
    addEvent: (calendarId: string, event: Omit<CalendarEvent, 'id'>) => void;
    deleteCalendar: (calendarId: string) => void;
    updateCalendars: (updater: (prevCalendars: Calendar[]) => Calendar[]) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType>({} as CalendarContextType);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [calendars, setCalendars] = useState<Calendar[]>([]);

    const updateCalendars = useCallback(async (updater: (prevCalendars: Calendar[]) => Calendar[]) => {
        setCalendars(prev => {
            const newCalendars = updater(prev);
            saveCalendars(newCalendars); // Автоматическое сохранение
            return newCalendars;
        });
    }, []);

    useEffect(() => {
        const initializeCalendars = async () => {
            const loadedCalendars = await loadCalendars();
            setCalendars(loadedCalendars);
        };
        initializeCalendars();
    }, []);

    const addCalendar = useCallback((name: string) => {
        updateCalendars(prev => {
            const newCalendar: Calendar = {
                id: Date.now().toString(),
                name,
                color: '#007AFF',
                events: []
            };
            return [...prev, newCalendar];
        });
    }, [updateCalendars]);

    const addEvent = useCallback((calendarId: string, event: Omit<CalendarEvent, 'id'>) => {
        updateCalendars(prev => prev.map(cal => 
            cal.id === calendarId 
                ? { ...cal, events: [...cal.events, { ...event, id: Date.now().toString() }] } 
                : cal
        ));
    }, [updateCalendars]);

    const deleteCalendar = useCallback((calendarId: string) => {
        updateCalendars(prev => prev.filter(cal => cal.id !== calendarId));
    }, [updateCalendars]);

    return (
        <CalendarContext.Provider value={{ 
            calendars,
            addCalendar,
            addEvent,
            deleteCalendar,
            updateCalendars // Экспортируем новую функцию
        }}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => useContext(CalendarContext);