// src/screens/CalendarScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Pressable } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';

interface CalendarScreenProps {
  route: RouteProp<RootStackParamList, 'Calendar'>;
  navigation: StackNavigationProp<RootStackParamList, 'Calendar'>;
}

const CalendarDay: React.FC<{ date: Date; onDatePress: (date: Date) => void, hasEvent: boolean, onLongPress: (date: Date) => void }> = ({ date, onDatePress, hasEvent, onLongPress }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Pressable
      style={[styles.dayCell, { backgroundColor: colors.secondary }]}
      onPress={() => onDatePress(date)}
      onLongPress={() => onLongPress(date)}
    >
      <Text style={{ color: colors.text }}>{date.getDate()}</Text>
      {hasEvent && <View style={styles.eventIndicator} />}
    </Pressable>
  );
};

const ActionMenu = ({ isVisible, onAddEvent, onTestButton, onClose }: { isVisible: boolean, onAddEvent: () => void, onTestButton: () => void, onClose: () => void }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.actionMenu}>
      <TouchableOpacity style={styles.actionButton} onPress={onAddEvent}>
        <Text>Add Event</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onTestButton}>
        <Text>Test Button</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const CalendarScreen: React.FC<CalendarScreenProps> = ({ route, navigation }) => {
  const { calendarId } = route.params;
  const { calendars } = useCalendar();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = startOfMonth(currentDate);

  const calendar = calendars.find(c => c.id === calendarId);

  const eventsForCalendar = calendar?.events || [];

  const eventsByDate = useMemo(() => {
    const groupedEvents: { [date: string]: any[] } = {};
    eventsForCalendar.forEach(event => {
      const date = format(new Date(event.endDate), 'yyyy-MM-dd');
      if (!groupedEvents[date]) {
        groupedEvents[date] = [];
      }
      groupedEvents[date].push(event);
    });
    return groupedEvents;
  }, [eventsForCalendar]);

  const handleDatePress = useCallback((date: Date) => {
    setSelectedDate(date);
    navigation.navigate('EventList', { calendarId: calendarId, selectedDate: date.toISOString() });
  }, [navigation, calendarId]);

  const handleLongPress = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsActionMenuVisible(true);
  }, []);

  const handleAddEventAction = useCallback(() => {
    setIsActionMenuVisible(false);
    if (selectedDate) {
      navigation.navigate('AddEvent', { calendarId: calendarId, selectedDate: selectedDate.toISOString() });
    }
  }, [navigation, calendarId, selectedDate]);

  const handleTestAction = useCallback(() => {
    setIsActionMenuVisible(false);
    Alert.alert('Test Button Pressed', `Selected Date: ${selectedDate?.toISOString()}`);
  }, [selectedDate]);

  const renderDay = useCallback((index: number) => {
    const date = new Date(firstDayOfMonth);
    date.setDate(index + 1);
    const dateString = format(date, 'yyyy-MM-dd');
    const hasEvent = !!eventsByDate[dateString];

    return <CalendarDay key={index} date={date} onDatePress={handleDatePress} hasEvent={hasEvent} onLongPress={handleLongPress} />;
  }, [firstDayOfMonth, handleDatePress, eventsByDate, handleLongPress]);

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
      <Text style={[globalStyles.title, { color: colors.text }]}>
        {calendar?.name} Calendar
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: daysInMonth }).map((_, index) => renderDay(index))}
      </View>

      <ActionMenu
        isVisible={isActionMenuVisible}
        onAddEvent={handleAddEventAction}
        onTestButton={handleTestAction}
        onClose={() => setIsActionMenuVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayCell: {
    width: 50,
    height: 50,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  eventIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'red',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  actionMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
});

export default CalendarScreen;