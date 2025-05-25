// src/contexts/CalendarContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Calendar, CalendarEvent, EventType, CalendarMember } from '../types/types';
import { loadCalendars, saveCalendars } from '../utils/storage';
import api from '../api/client';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

interface CalendarContextType {
    calendars: Calendar[];
    addCalendar: (name: string) => void;
    addEvent: (calendarId: string, event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    deleteCalendar: (calendarId: string) => void;
    updateCalendars: (updater: (prevCalendars: Calendar[]) => Calendar[]) => Promise<void>;
    syncEvents: (calendarId: string) => Promise<void>;
    clearDateEvents: (calendarId: string, date: Date) => Promise<void>;
    addTestEvent: (calendarId: string, date: Date) => Promise<void>;
    syncCalendars: () => Promise<void>;
    joinCalendar: (code: string) => Promise<void>;
    getCalendarMembers: (calendarId: string) => Promise<CalendarMember[]>;
    updateEvent: (calendarId: string, eventId: string, event: CalendarEvent) => Promise<void>;
    deleteEvent: (calendarId: string, eventId: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType>({} as CalendarContextType);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const { user: currentUser, refreshSession, createGuestSession } = useAuth();

    const mergeCalendars = (
    serverCalendars: Calendar[],
    localCalendars: Calendar[]
    ): Calendar[] => {
    const serverMap = new Map(serverCalendars.map(c => [c.id, c]));
    
    return serverCalendars.map(serverCal => ({
        ...serverCal,
        events: localCalendars.find(lc => lc.id === serverCal.id)?.events || [],
        role: serverCal.role
    }));
    };

    const mergeEvents = (local: CalendarEvent[], server: CalendarEvent[]): CalendarEvent[] => {
    const serverMap = new Map(
        server.map(e => [
        e.id, 
        {
            ...e,
            start_datetime: e.start_datetime || '',
            end_datetime: e.end_datetime || '',
            syncStatus: 'synced' as const
        }
        ])
    );

    const localPending = local.filter((e): e is CalendarEvent => 
        e.sync_status === 'pending' && !serverMap.has(e.id)
    );

    return [
        ...localPending,
        ...Array.from(serverMap.values()).map(e => ({
        ...e,
        syncStatus: 'synced' as const
        }))
    ];
    };

    const updateCalendars = useCallback(async (updater: (prevCalendars: Calendar[]) => Calendar[]) => {
        setCalendars(prev => {
            const newCalendars = updater(prev);
            saveCalendars(newCalendars);
            return newCalendars;
        });
    }, []);

    const syncEvents = useCallback(async (calendarId: string) => {
        try {
            const response = await api.get(`/calendars/${calendarId}/events`);
            const serverEvents = response.data.map((serverEvent: any) => ({
            ...serverEvent,
            start_datetime: serverEvent.start_datetime || '',
            end_datetime: serverEvent.end_datetime || '',
            syncStatus: 'synced' as const
            }));
            
            updateCalendars(prev => 
            prev.map(cal => 
                cal.id === calendarId 
                ? { ...cal, events: mergeEvents(cal.events, serverEvents) } 
                : cal
            )
            );
            
        } catch (error) {
            console.error('Ошибка синхронизации:', {
            error,
            calendarId,
            timestamp: new Date().toISOString()
            });
            Alert.alert('Ошибка', 'Не удалось загрузить события');
        }
    }, [updateCalendars]);

const addCalendar = useCallback((name: string) => {
  if (!currentUser?.id) {
    Alert.alert('Ошибка', 'Пользователь не авторизован');
    return;
  }

    updateCalendars(prev => {
        const tempId = `temp_${Date.now()}`;
        const newCalendar: Calendar = {
        id: tempId,
        name,
        events: [],
        role: 'owner',
        ownerId: currentUser.id
        };

        api.post('/calendars', { name })
        .then(response => {
            updateCalendars(prevCalendars => 
            prevCalendars.map(c => 
                c.id === tempId ? { 
                ...response.data, 
                role: 'owner',
                events: c.events 
                } : c
            )
            );
        })
        .catch(error => {
            updateCalendars(prev => prev.filter(c => c.id !== tempId));
        });

        return [...prev, newCalendar];
    });
    }, [currentUser?.id, updateCalendars]);

    const addEvent = useCallback(async (calendarId: string, event: Omit<CalendarEvent, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    try {
        const newEvent: CalendarEvent = { 
        ...event,
        id: tempId,
        sync_status: 'pending' as const
        };
        
        updateCalendars(prev => 
        prev.map(cal => 
            cal.id === calendarId 
            ? { ...cal, events: [...cal.events, newEvent] }
            : cal
        )
        );

        const response = await api.post<CalendarEvent>('/events', {
        ...event,
        calendar_id: calendarId
        });

        updateCalendars(prev => 
        prev.map(cal => 
            cal.id === calendarId 
            ? { 
                ...cal, 
                events: cal.events.map(e => 
                    e.id === tempId 
                    ? { ...response.data, syncStatus: 'synced' as const }
                    : e
                )
                } 
            : cal
        )
        );
    } catch (error) {
        updateCalendars(prev => 
        prev.map(cal => 
            cal.id === calendarId 
            ? { ...cal, events: cal.events.filter(e => e.id !== tempId) }
            : cal
        )
        );
    }
    }, [updateCalendars]);

    const updateEvent = useCallback(async (calendarId: string, eventId: string, event: CalendarEvent) => {
    try {
        await api.put(`/events/${eventId}`, event);
        await syncEvents(calendarId);
    } catch (error) {
        console.error('Ошибка обновления события:', error);
        throw error;
    }
    }, [syncEvents]);

    const deleteEvent = useCallback(async (calendarId: string, eventId: string) => {
    try {
        await api.delete(`/events/${eventId}`);
        await syncEvents(calendarId);
    } catch (error) {
        console.error('Ошибка удаления события:', error);
        throw error;
    }
    }, [syncEvents]);

    const deleteCalendar = useCallback(async (calendarId: string) => {
        let backupCalendars: Calendar[] = [];
        try {
            backupCalendars = [...calendars];
            updateCalendars(prev => prev.filter(cal => cal.id !== calendarId));
            await api.delete(`/calendars/${calendarId}`);
        } catch (error) {
            updateCalendars(() => backupCalendars);
            Alert.alert('Ошибка', 'Не удалось удалить календарь');
        }
    }, [calendars, updateCalendars]);

    const clearDateEvents = useCallback(async (calendarId: string, date: Date) => {
    try {
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        console.log('Sending clear request:', {
        calendarId,
        start: dateStart,
        end: dateEnd
        });

        const response = await api.post('/events/clear-events', {
        calendarId,
        start: dateStart.toISOString(),
        end: dateEnd.toISOString()
        });

        console.log('Clear response:', response.data);

        updateCalendars(prev => 
        prev.map(cal => 
            cal.id === calendarId 
            ? { ...cal, events: cal.events.filter(e => {
                const eventDate = e.attach_to_end && e.end_datetime 
                    ? new Date(e.end_datetime)
                    : new Date(e.start_datetime!);
                return !(eventDate >= dateStart && eventDate <= dateEnd);
                })}
            : cal
        )
        );
    } catch (error) {
        console.error('Ошибка очистки событий:', {
        error,
        requestData: {
            calendarId,
            date: date.toISOString()
        }
        });
        Alert.alert('Ошибка', 'Не удалось очистить дату');
    }
    }, [updateCalendars]);

    const addTestEvent = useCallback(async (calendarId: string, date: Date) => {
        const testEvent = {
            title: 'Тестовое событие',
            type: 'lab' as EventType,
            start_datetime: new Date(date).toISOString(),
            end_datetime: new Date(date.setHours(date.getHours() + 1)).toISOString(),
            links: [],
            attach_to_end: false
        };
        try {
            await addEvent(calendarId, testEvent);
            Alert.alert('Успешно', 'Тестовое событие добавлено');
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось добавить тестовое событие');
        }
    }, [addEvent]);

    const syncCalendars = useCallback(async () => {
    try {
        const serverResponse = await api.get('/calendars');
        const serverCalendars: Calendar[] = serverResponse.data;

        updateCalendars(prev => {
        const merged = mergeCalendars(serverCalendars, prev);
        return merged.filter(c => serverCalendars.some(sc => sc.id === c.id));
        });

        const promises = serverCalendars.map(cal => syncEvents(cal.id));
        await Promise.all(promises);

    } catch (error: any) {
        if (error?.response?.status === 401) {
        try {
            await refreshSession();
            return syncCalendars();
        } catch (refreshError) {
            await createGuestSession();
            throw refreshError;
        }
        }
        
        if (error?.response?.data?.code === 'REFRESH_FAILED') {
        await createGuestSession();
        }

        console.error('[SYNC] Sync failed:', {
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString()
        });
        
        throw error;
    }
    }, [updateCalendars, syncEvents, useAuth]);

    const joinCalendar = useCallback(async (code: string) => {
    try {
        await api.post('/calendars/join', { code });
        await syncCalendars();
    } catch (error) {
        throw new Error('Не удалось присоединиться к календарю');
    }
    }, [syncCalendars]);

    const getCalendarMembers = useCallback(async (calendarId: string) => {
    const response = await api.get(`/calendars/${calendarId}/members`);
    return response.data;
    }, []);

    useEffect(() => {
        const initializeCalendars = async () => {
            try {
                const [localCalendars, serverResponse] = await Promise.all([
                    loadCalendars(),
                    api.get('/calendars')
                ]);
                const merged = mergeCalendars(serverResponse.data, localCalendars);
                setCalendars(merged);
                saveCalendars(merged);
                merged.forEach(cal => syncEvents(cal.id));
            } catch (error) {
                const localCalendars = await loadCalendars();
                setCalendars(localCalendars);
            }
        };
        initializeCalendars();
    }, [syncEvents]);
    
    useEffect(() => {
        const syncInterval = setInterval(() => {
            syncCalendars();
        }, 60000);

        return () => clearInterval(syncInterval);
    }, [syncCalendars]);

    return (
        <CalendarContext.Provider value={{ 
            calendars,
            addCalendar,
            addEvent,
            deleteCalendar,
            updateCalendars,
            syncEvents,
            clearDateEvents,
            addTestEvent,
            syncCalendars,
            joinCalendar,
            getCalendarMembers,
            updateEvent,
            deleteEvent
        }}>
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