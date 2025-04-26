// src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { globalStyles } from '../styles/globalStyles';
import MainButton from '../components/MainButton';
import { Calendar } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation'; // Import!

interface HomeScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [newCalendarName, setNewCalendarName] = useState('');
  const { calendars, addCalendar } = useCalendar();
  const { theme, setTheme, styles, colors } = useTheme();

  const handleAddCalendar = useCallback(() => {
    if (newCalendarName) {
      addCalendar(newCalendarName);
      setNewCalendarName('');
    }
  }, [newCalendarName, addCalendar]);

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const renderCalendarItem = useCallback(({ item }: { item: Calendar }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Calendar', { calendarId: item.id })}
      style={[localStyles.calendarItem, { backgroundColor: colors.secondary }]}
    >
      <Text style={{ color: colors.text }}>{item.name}</Text>
    </TouchableOpacity>
  ), [navigation, colors.secondary, colors.text]);

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
      <TextInput
        value={newCalendarName}
        onChangeText={setNewCalendarName}
        placeholder="New calendar name"
        placeholderTextColor={colors.text}
        style={[globalStyles.input, { color: colors.text, borderColor: colors.text }]}
      />
      <MainButton title="Add Calendar" onPress={handleAddCalendar} />
      <MainButton title="Toggle Theme" onPress={handleToggleTheme} />
      <FlatList
        data={calendars}
        keyExtractor={(item) => item.id}
        renderItem={renderCalendarItem}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  calendarItem: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
});

export default HomeScreen;
