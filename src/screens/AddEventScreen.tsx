// src/screens/AddEventScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface AddEventScreenProps {
  route: RouteProp<RootStackParamList, 'AddEvent'>;
}

const AddEventScreen: React.FC<AddEventScreenProps> = ({ route }) => {
  const { calendarId, selectedDate } = route.params;
  const { addEvent } = useCalendar();
  const { theme, colors } = useTheme();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [links, setLinks] = useState(['']);

  const handleAddLink = useCallback(() => {
    setLinks([...links, '']);
  }, [links]);

  const handleLinkChange = useCallback((text: string, index: number) => {
    const newLinks = [...links];
    newLinks[index] = text;
    setLinks(newLinks);
  }, [links]);

  const handleAddEvent = useCallback(() => {
    addEvent(calendarId, {
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      links: links,
    });
    navigation.goBack();
  }, [calendarId, title, description, startDate, endDate, links, addEvent, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add Event</Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.text }]}
        placeholder="Title"
        placeholderTextColor={colors.text}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.text }]}
        placeholder="Description"
        placeholderTextColor={colors.text}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.text }]}
        placeholder="Start Date"
        placeholderTextColor={colors.text}
        value={startDate}
        onChangeText={setStartDate}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.text }]}
        placeholder="End Date"
        placeholderTextColor={colors.text}
        value={endDate}
        onChangeText={setEndDate}
      />

      <Text style={{ color: colors.text }}>Links:</Text>
      {links.map((link, index) => (
        <TextInput
          key={index}
          style={[styles.input, { color: colors.text, borderColor: colors.text }]}
          placeholder="Link"
          placeholderTextColor={colors.text}
          value={link}
          onChangeText={(text) => handleLinkChange(text, index)}
        />
      ))}
      <Button title="Add Link" onPress={handleAddLink} />

      <Button title="Create Event" onPress={handleAddEvent} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
});

export default AddEventScreen;