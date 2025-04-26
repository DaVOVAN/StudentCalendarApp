// src/screens/EventListScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { format } from 'date-fns';
import { Event } from '../types/types';  // Import the Event type

interface EventListScreenProps {
  route: RouteProp<RootStackParamList, 'EventList'>;
}

const EventListScreen: React.FC<EventListScreenProps> = ({ route }) => {
  const { calendarId, selectedDate } = route.params;
  const { calendars, addEvent } = useCalendar();
  const { theme, colors } = useTheme();

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const calendar = calendars.find(c => c.id === calendarId);
  const eventsForDate = calendar?.events.filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(new Date(selectedDate), 'yyyy-MM-dd')) || [];

  const handleAddEvent = useCallback(() => {
    if (eventTitle) {
      addEvent(calendarId, {
        date: selectedDate,
        title: eventTitle,
        description: eventDescription,
      });
      setEventTitle('');
      setEventDescription('');
    }
  }, [selectedDate, eventTitle, eventDescription, calendarId, addEvent]);

  const renderItem = useCallback(({ item }: { item: Event }) => (  // Specify the type of item
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
    </View>
  ), []);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.dateTitle}>{format(new Date(selectedDate), 'PPP')}</Text>

      <FlatList
        data={eventsForDate}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <TextInput
        placeholder="Title"
        placeholderTextColor={colors.text}
        value={eventTitle}
        onChangeText={setEventTitle}
        style={[styles.input, { color: colors.text, borderColor: colors.text }]}
      />
      <TextInput
        placeholder="Description"
        placeholderTextColor={colors.text}
        value={eventDescription}
        onChangeText={setEventDescription}
        style={[styles.input, { color: colors.text, borderColor: colors.text }]}
      />
      <Button title="Add Event" onPress={handleAddEvent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
});

export default EventListScreen;