// src/screens/ViewEventScreen.tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Button, Linking } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { format } from 'date-fns';

interface ViewEventScreenProps {
  route: RouteProp<RootStackParamList, 'ViewEvent'>;
}

const ViewEventScreen: React.FC<ViewEventScreenProps> = ({ route }) => {
  const { calendarId, eventId } = route.params;
  const { calendars } = useCalendar();
  const { theme, colors } = useTheme();

  const calendar = calendars.find(c => c.id === calendarId);
  const event = calendar?.events.find(e => e.id === eventId);

  const handleLinkPress = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Text style={{ color: colors.text }}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
      <Text style={{ color: colors.text }}>Description: {event.description}</Text>
      <Text style={{ color: colors.text }}>Start Date: {format(new Date(event.startDate), 'PPP')}</Text>
      <Text style={{ color: colors.text }}>End Date: {format(new Date(event.endDate), 'PPP')}</Text>

      <Text style={[styles.subtitle, { color: colors.text }]}>Links:</Text>
      {event.links.map((link, index) => (
        <Button key={index} title={link} onPress={() => handleLinkPress(link)} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
});

export default ViewEventScreen;