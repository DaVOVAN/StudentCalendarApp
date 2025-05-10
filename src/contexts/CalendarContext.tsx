// src/contexts/CalendarContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Calendar, CalendarEvent } from '../types/types';
import { loadCalendars, saveCalendars } from '../utils/storage';
import api from '../api/client';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface CalendarContextType {
    calendars: Calendar[];
    addCalendar: (name: string) => void;
    addEvent: (calendarId: string, event: Omit<CalendarEvent, 'id'>) => void;
    deleteCalendar: (calendarId: string) => void;
    updateCalendars: (updater: (prevCalendars: Calendar[]) => Calendar[]) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType>({} as CalendarContextType);

const mergeCalendars = (serverCalendars: any[], localCalendars: Calendar[]): Calendar[] => {
    const serverMap = new Map(serverCalendars.map(c => [c.id, c]));
    const merged = localCalendars.map(local => {
        const server = serverMap.get(local.id);
        return server ? { ...local, ...server } : local;
    });
    serverCalendars.forEach(server => {
        if (!merged.some(c => c.id === server.id)) {
            merged.push({
                id: server.id,
                name: server.name,
                color: '#007AFF',
                events: []
            });
        }
    });
    return merged;
};

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const { user: currentUser } = useAuth();

    const updateCalendars = useCallback(async (updater: (prevCalendars: Calendar[]) => Calendar[]) => {
        setCalendars(prev => {
            const newCalendars = updater(prev);
            saveCalendars(newCalendars);
            return newCalendars;
        });
    }, []);

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
            ownerId: currentUser.id
            };

            api.post('/calendars', { name })
            .then(response => {
                updateCalendars(prevCalendars => 
                prevCalendars.map(c => 
                    c.id === tempId ? { 
                    ...c, 
                    id: response.data.id,
                    ownerId: currentUser.id
                    } : c
                )
                );
            })
            .catch(error => {
                updateCalendars(prev => prev.filter(c => c.id !== tempId));
                Alert.alert('Ошибка', 'Не удалось создать календарь');
            });

            return [...prev, newCalendar];
        });
    }, [currentUser?.id, updateCalendars]);

    const addEvent = useCallback((calendarId: string, event: Omit<CalendarEvent, 'id'>) => {
        updateCalendars(prev => prev.map(cal => 
            cal.id === calendarId 
                ? { ...cal, events: [...cal.events, { ...event, id: Date.now().toString() }] } 
                : cal
        ));
    }, [updateCalendars]);

    const deleteCalendar = useCallback(async (calendarId: string) => {
    let backupCalendars: Calendar[] = [];
    
    try {
        const calendarToDelete = calendars.find(c => c.id === calendarId);
        const currentUserId = currentUser?.id;

        if (!calendarToDelete || !currentUserId) {
        throw new Error('Календарь или пользователь не найдены');
        }

        console.log("calendarToDelete.ownerId:", calendarToDelete.ownerId);
        console.log("currentUser?.id:", currentUser?.id);
        if (calendarToDelete.ownerId !== currentUserId) {
        Alert.alert('Ошибка', 'Только владелец может удалить календарь');
        return;
        }

        backupCalendars = [...calendars];
        
        updateCalendars(prev => prev.filter(cal => cal.id !== calendarId));
        
        await api.delete(`/calendars/${calendarId}`);
        
    } catch (error: unknown) {
        updateCalendars(() => backupCalendars);
        
        let errorMessage = 'Не удалось удалить календарь';
        
        if (error instanceof Error) {
        errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
        }

        Alert.alert(
        'Ошибка удаления',
        `${errorMessage}\n\nЛокальные изменения отменены`,
        [{ text: 'OK', style: 'destructive' }]
        );

        if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 403) {
                try {
                    const refreshedCalendarsResponse = await api.get('/calendars');
                    const refreshedCalendars = refreshedCalendarsResponse.data;
                    updateCalendars(() => refreshedCalendars);
                } catch (refreshError) {
                    console.error("Ошибка при обновлении календарей:", refreshError);
                }
            }
        }
    }
    }, [calendars, currentUser?.id, updateCalendars]);

    useEffect(() => {
        const initializeCalendars = async () => {
            try {
                const [localCalendars, serverResponse] = await Promise.all([
                    loadCalendars(),
                    api.get('/calendars')
                ]);

                const serverCalendars = serverResponse.data.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    events: [],
                    ownerId: c.owner_id
                }));

                const merged = mergeCalendars(serverCalendars, localCalendars);
                setCalendars(merged);
                saveCalendars(merged);
            } catch (error) {
                const localCalendars = await loadCalendars();
                setCalendars(localCalendars);
            }
        };
        initializeCalendars();
    }, []);

    return (
        <CalendarContext.Provider value={{ 
            calendars,
            addCalendar,
            addEvent,
            deleteCalendar,
            updateCalendars
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