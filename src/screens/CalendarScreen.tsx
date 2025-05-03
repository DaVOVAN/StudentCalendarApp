// src/screens/CalendarScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
  addMonths 
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { MaterialIcons } from '@expo/vector-icons';
import ActionMenu from '../components/ActionMenu';
import { CalendarEvent } from '../types/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

const CalendarDay: React.FC<{
    date: Date;
    onDatePress: (date: Date) => void;
    hasEvent: boolean;
    onLongPress: (date: Date) => void;
    isEmergency: boolean;
    isCurrentMonth: boolean;
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
    const { calendars } = useCalendar();
    const { colors } = useTheme();
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);

    const monthStart = startOfMonth(currentMonth);
    const startDate = subDays(monthStart, getDay(monthStart));
    const endDate = addDays(startDate, 41);

    const calendar = calendars.find(c => c.id === calendarId);
    const eventsForCalendar = calendar?.events || [];

    const eventsByDate = useMemo(() => {
        const groupedEvents: Record<string, CalendarEvent[]> = {};
        eventsForCalendar.forEach(event => {
            const baseDate = event.attachToEnd 
                ? event.endDate || event.startDate 
                : event.startDate || event.endDate;
            
            if (!baseDate) return;

            const dateKey = format(new Date(baseDate), 'yyyy-MM-dd');
            groupedEvents[dateKey] = groupedEvents[dateKey] || [];
            groupedEvents[dateKey].push(event);
        });
        return groupedEvents;
    }, [eventsForCalendar]);

    const renderWeekDays = () => (
        <View style={styles.weekDaysContainer}>
            {[...Array(7)].map((_, i) => (
                <Text key={i} style={[styles.weekDay, { color: colors.text }]}>
                    {format(addDays(startDate, i), 'EEEEEE', { locale: ru })}
                </Text>
            ))}
        </View>
    );

    const handleDatePress = useCallback((date: Date) => {
        navigation.navigate('EventList', { 
            calendarId, 
            selectedDate: date.toISOString() 
        });
    }, [calendarId, navigation]);

    const handleLongPress = useCallback((date: Date) => {
        setSelectedDate(date);
        setIsActionMenuVisible(true);
    }, []);

    const handleAddEvent = useCallback(() => {
        setIsActionMenuVisible(false);
        selectedDate && navigation.navigate('AddEvent', { 
            calendarId, 
            selectedDate: selectedDate.toISOString() 
        });
    }, [calendarId, selectedDate, navigation]);

    return (
        <View style={[styles.container, { backgroundColor: colors.primary }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{calendar?.name}</Text>
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
            </View>

            {renderWeekDays()}
            <View style={styles.grid}>
                {eachDayOfInterval({ start: startDate, end: endDate }).map((date, index) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const hasEvent = !!eventsByDate[dateKey];
                    const isEmergency = eventsByDate[dateKey]?.some(e => e.isEmergency);
                    const isCurrentMonth = isSameMonth(date, currentMonth);

                    return (
                        <CalendarDay
                            key={index}
                            date={date}
                            onDatePress={handleDatePress}
                            hasEvent={hasEvent}
                            onLongPress={handleLongPress}
                            isEmergency={isEmergency}
                            isCurrentMonth={isCurrentMonth}
                        />
                    );
                })}
            </View>

            <ActionMenu
                isVisible={isActionMenuVisible}
                onAddEvent={handleAddEvent}
                onClose={() => setIsActionMenuVisible(false)}
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
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    monthControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    monthText: {
        fontSize: 20,
        marginHorizontal: 16,
        textTransform: 'capitalize',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
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
});

export default CalendarScreen;