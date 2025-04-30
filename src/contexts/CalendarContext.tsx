// src/contexts/CalendarContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Calendar, CalendarEvent } from '../types/types';
import { loadCalendars, saveCalendars } from '../utils/storage';

interface CalendarContextType {
    calendars: Calendar[];
    addCalendar: (name: string) => void;
    addEvent: (calendarId: string, event: Omit<CalendarEvent, 'id'>) => void;
    deleteCalendar: (calendarId: string) => void;
}

const CalendarContext = createContext<CalendarContextType>({} as CalendarContextType);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [calendars, setCalendars] = useState<Calendar[]>([]);

    useEffect(() => {
        const initializeCalendars = async () => {
            const loadedCalendars = await loadCalendars();
            setCalendars(loadedCalendars);
        };
        initializeCalendars();
    }, []);

    const addCalendar = (name: string) => {
        const newCalendar: Calendar = {
            id: Date.now().toString(),
            name,
            color: '#007AFF',
            events: [],
        };
        setCalendars(prev => [...prev, newCalendar]);
        saveCalendars([...calendars, newCalendar]);
    };

    const addEvent = (calendarId: string, event: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = { ...event, id: Date.now().toString() };
        const updated = calendars.map(cal => 
            cal.id === calendarId ? {...cal, events: [...cal.events, newEvent]} : cal
        );
        setCalendars(updated);
        saveCalendars(updated);
    };

    const deleteCalendar = (calendarId: string) => {
        const filtered = calendars.filter(cal => cal.id !== calendarId);
        setCalendars(filtered);
        saveCalendars(filtered);
    };

    return (
        <CalendarContext.Provider value={{ calendars, addCalendar, addEvent, deleteCalendar }}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => useContext(CalendarContext);