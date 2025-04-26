import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';
import { globalStyles } from '../styles/globalStyles';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface CalendarScreenProps {
  route: RouteProp<RootStackParamList, 'Calendar'>;
}

const CalendarDay: React.FC<{ date: Date; onDatePress: (date: Date) => void }> = ({ date, onDatePress }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <TouchableOpacity
      style={[styles.dayCell, { backgroundColor: colors.secondary }]}
      onPress={() => onDatePress(date)}
    >
      <Text style={{ color: colors.text }}>{date.getDate()}</Text>
    </TouchableOpacity>
  );
};


const CalendarScreen: React.FC<CalendarScreenProps> = ({ route }) => {
  const { calendarId } = route.params;
  const { calendars, addEvent } = useCalendar();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = startOfMonth(currentDate);

  const calendar = calendars.find(c => c.id === calendarId);

  const handleDatePress = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsModalVisible(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    if (selectedDate && eventTitle) {
      addEvent(calendarId, {
        date: selectedDate.toISOString(),
        title: eventTitle,
        description: eventDescription,
      });
      setIsModalVisible(false);
      setEventTitle('');
      setEventDescription('');
    }
  }, [selectedDate, eventTitle, eventDescription, calendarId, addEvent]);

  const renderDay = useCallback((index: number) => {
    const date = new Date(firstDayOfMonth);
    date.setDate(index + 1);
    return <CalendarDay key={index} date={date} onDatePress={handleDatePress} />;
}, [firstDayOfMonth, handleDatePress]);


return (
  <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
    <Text style={[globalStyles.title, { color: colors.text }]}>
      {calendar?.name} Calendar
    </Text>

    <View style={styles.grid}>
      {Array.from({ length: daysInMonth }).map((_, index) => renderDay(index))}
    </View>

    <Modal visible={isModalVisible} animationType="slide">
      <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
        <Text style={{ color: colors.text }}>New Event</Text>
        <TextInput
          placeholder="Title"
          placeholderTextColor={colors.text}
          value={eventTitle}
          onChangeText={setEventTitle}
          style={[globalStyles.input, { color: colors.text, borderColor: colors.text }]}
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor={colors.text}
          value={eventDescription}
          onChangeText={setEventDescription}
          style={[globalStyles.input, { color: colors.text, borderColor: colors.text }]}
        />
        <Button title="Add Event" onPress={handleAddEvent} />
        <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
      </View>
    </Modal>
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
});

export default CalendarScreen;