// src/screens/CalendarScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  format, 
  getDay, 
  isSameMonth, 
  addDays, 
  subDays, 
  eachDayOfInterval, 
  startOfMonth, 
  subMonths, 
  addMonths,
  isSameDay
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { MaterialIcons } from '@expo/vector-icons';
import ActionMenu from '../components/ActionMenu';
import { CalendarEvent } from '../types/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const CalendarDay: React.FC<{
    date: Date;
    onDatePress: (date: Date) => void;
    hasEvent: boolean;
    onLongPress: (date: Date) => void;
    isEmergency: boolean;
    isCurrentMonth: boolean;
    hasUnseen: boolean;
}> = ({ date, onDatePress, hasEvent, onLongPress, isEmergency, isCurrentMonth }) => {
    const { colors } = useTheme();
    
    return (
        <Pressable
            style={[
                styles.dayCell,
                { backgroundColor: colors.calendarDayBackground },
                !isCurrentMonth && { backgroundColor: colors.calendarOtherMonth },
                isEmergency && { borderWidth: 2, borderColor: colors.emergency }
            ]}
            onPress={() => onDatePress(date)}
            onLongPress={() => onLongPress(date)}
        >
            <Text style={{ 
                color: isCurrentMonth ? colors.text : colors.secondaryText,
                fontSize: 16,
                fontWeight: isCurrentMonth ? '500' : '300'
            }}>
                {format(date, 'd')}
            </Text>
            {hasEvent && <View style={[styles.eventIndicator, { backgroundColor: colors.accent }]} />}
        </Pressable>
    );
};

const CalendarScreen: React.FC<{ route: any }> = ({ route }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { calendarId } = route.params;
    const { calendars, clearDateEvents, addTestEvent, syncEvents, syncCalendars } = useCalendar(); 
    const { colors } = useTheme();
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);

    const monthStart = startOfMonth(currentMonth);
    const startDate = subDays(monthStart, getDay(monthStart));
    const endDate = addDays(startDate, 41);

    const calendar = calendars.find(c => c.id === calendarId);
    const eventsForCalendar = calendar?.events || [];
    const { user } = useAuth();
    const role = calendar?.role || 'guest';
    
    const isOwner = role === 'owner';

    const eventsByDate = useMemo(() => {
        const groupedEvents: Record<string, CalendarEvent[]> = {};
        const unseenDates: Set<string> = new Set();
        
        eventsForCalendar.forEach(event => {
            if (event.sync_status === 'pending') return;
            
            const baseDate = event.attach_to_end && event.end_datetime 
            ? event.end_datetime 
            : event.start_datetime;

            if (!baseDate) return;
            const dateKey = format(new Date(baseDate), 'yyyy-MM-dd');
            groupedEvents[dateKey] = groupedEvents[dateKey] || [];
            groupedEvents[dateKey].push(event);

            if (!event.is_seen) {
                unseenDates.add(dateKey);
            }
        });

        return { groupedEvents, unseenDates };
    }, [eventsForCalendar]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (calendarId) {
            syncEvents(calendarId);
            syncCalendars();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [calendarId, syncEvents, syncCalendars]);

    useFocusEffect(
        useCallback(() => {
            const fetchEvents = async () => {
                try {
                    await syncEvents(calendarId);
                    console.log("Синхронизация событий...");
                    
                } catch (error) {
                    console.error('Ошибка синхронизации событий:', error);
                }
            };
            fetchEvents();
        }, [syncEvents, calendarId])
    );

    const handleDatePress = useCallback((date: Date) => {
        if (!calendarId) return;
        
        navigation.navigate('EventList', { 
            calendarId: calendarId,
            selectedDate: date.toISOString(),
            validatedDate: date.toISOString()
        });
    }, [calendarId, navigation]);

    const handleLongPress = useCallback((date: Date) => {
        setSelectedDate(date);
        setIsActionMenuVisible(true);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.primary }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => isOwner && navigation.navigate('CalendarSettings', { calendarId })}
                    style={styles.settingsButton}
                    disabled={!isOwner}
                >
                    <MaterialIcons 
                        name="settings" 
                        size={24} 
                        color={isOwner ? colors.text : colors.secondaryText} 
                    />
                </TouchableOpacity>
                
                <Text style={[styles.title, { color: colors.text }]}>{calendar?.name}</Text>
                
                <TouchableOpacity 
                    onPress={() => navigation.navigate('CalendarMembers', { calendarId })}
                    style={styles.membersButton}
                    disabled={user?.isGuest || role === 'member'}
                >
                    <MaterialIcons 
                        name="people" 
                        size={24} 
                        color={(user?.isGuest || role === 'member') ? colors.secondaryText : colors.text} 
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.monthControls}>
                <TouchableOpacity onPress={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                    <MaterialIcons name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.monthText, { color: colors.text }]}>
                    {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                </Text>
                <TouchableOpacity onPress={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                    <MaterialIcons name="chevron-right" size={28} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {eachDayOfInterval({ start: startDate, end: endDate }).map((date, index) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const hasUnseen = eventsByDate.unseenDates.has(dateKey);
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const hasEvent = !!eventsByDate.groupedEvents[dateKey];
                    const isEmergency = eventsByDate.groupedEvents[dateKey]?.some(e => e.is_emergency);

                    return (
                    <Pressable
                        key={index}
                        style={[
                        styles.dayCell, {borderWidth: 2, borderColor: colors.calendarDayBackground},
                        { backgroundColor: colors.calendarDayBackground },
                        !isCurrentMonth && { backgroundColor: colors.calendarOtherMonth, borderColor: colors.calendarOtherMonth },
                        isEmergency && { backgroundColor: colors.emergency},
                        hasUnseen && {borderColor: colors.text}
                        ]}
                        onPress={() => handleDatePress(date)}
                        onLongPress={() => handleLongPress(date)}
                    >
                        <Text style={{ 
                        color: isCurrentMonth ? colors.text : colors.secondaryText,
                        fontSize: 16,
                        fontWeight: isCurrentMonth ? '500' : '300'
                        }}>
                        {format(date, 'd')}
                        </Text>
                        
                        {hasEvent && (
                        <View style={[styles.eventIndicator, { backgroundColor: colors.text }]} />
                        )}
                    </Pressable>
                    );
                })}
            </View>

            <ActionMenu
                isVisible={isActionMenuVisible}
                onClose={() => setIsActionMenuVisible(false)}
                selectedDate={selectedDate}
                onClearDate={(date) => {
                    if (calendarId) {
                        clearDateEvents(calendarId, date);
                    }
                }}
                onAddTestEvent={(date) => calendarId && addTestEvent(calendarId, date)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    settingsButton: {
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 8,
    },
    membersButton: {
        padding: 8,
    },
    monthControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    monthText: {
        fontSize: 20,
        marginHorizontal: 16,
        textTransform: 'capitalize',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '13%',
        height: '13%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2,
        marginHorizontal: 2,
    },
    eventIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        top: 2,
        right: 2,
    },
    unseenIndicator: {
        width: 6,
        height: 6,
        borderRadius: 4,
        position: 'absolute',
        top: 2,
        right: 2,
    },
});

export default CalendarScreen;