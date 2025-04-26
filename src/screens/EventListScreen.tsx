// src/screens/EventListScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { format } from 'date-fns';
import { Event } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp

interface EventListScreenProps {
  route: RouteProp<RootStackParamList, 'EventList'>;
  navigation: StackNavigationProp<RootStackParamList, 'EventList'>; // Add navigation prop
}

const EventListScreen: React.FC<EventListScreenProps> = ({ route, navigation }) => { // Get navigation from props
  const { calendarId, selectedDate } = route.params;
  const { calendars } = useCalendar();
  const { theme, colors } = useTheme();

  const calendar = calendars.find(c => c.id === calendarId);
  const eventsForDate = calendar?.events.filter(event => format(new Date(event.endDate), 'yyyy-MM-dd') === format(new Date(selectedDate), 'yyyy-MM-dd')) || [];

  const handleAddEvent = useCallback(() => {
    navigation.navigate('AddEvent', { calendarId: calendarId, selectedDate: selectedDate });
  }, [navigation, calendarId, selectedDate]);

  const handleViewEvent = useCallback((eventId: string) => {
    navigation.navigate('ViewEvent', { calendarId: calendarId, eventId: eventId });
  }, [navigation, calendarId]);

  const renderItem = useCallback(({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventItem} onPress={() => handleViewEvent(item.id)}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
    </TouchableOpacity>
  ), [handleViewEvent]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.dateTitle}>{format(new Date(selectedDate), 'PPP')}</Text>

      <FlatList
        data={eventsForDate}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
});

export default EventListScreen;