// src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { globalStyles } from '../styles/globalStyles';
import MainButton from '../components/MainButton';
import { Calendar } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation'; // Import!
import ActionMenu from '../components/ActionMenu';

interface HomeScreenProps {
    navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [newCalendarName, setNewCalendarName] = useState('');
    const { calendars, addCalendar, deleteCalendar } = useCalendar(); // Get deleteCalendar
    const { theme, setTheme, styles, colors } = useTheme();
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState<boolean>(false);


    const handleAddCalendar = useCallback(() => {
        if (newCalendarName) {
            addCalendar(newCalendarName);
            setNewCalendarName('');
        }
    }, [newCalendarName, addCalendar]);

    const handleToggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    const handleDeleteCalendar = useCallback(() => {
        if (selectedCalendarId) {
            Alert.alert(
                "Delete Calendar",
                "Are you sure you want to delete this calendar?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "OK", onPress: () => {
                            deleteCalendar(selectedCalendarId); // Call deleteCalendar
                            setSelectedCalendarId(null);
                            setIsActionMenuVisible(false);
                        }
                    }
                ]
            );
        }
    }, [selectedCalendarId, deleteCalendar]);

    const handleTestAction = useCallback(() => {
        console.log('Test Action', selectedCalendarId);
        setSelectedCalendarId(null);
        setIsActionMenuVisible(false);
    }, [selectedCalendarId]);

    const renderCalendarItem = useCallback(({ item }: { item: Calendar }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Calendar', { calendarId: item.id })}
            onLongPress={() => {
                setSelectedCalendarId(item.id);
                setIsActionMenuVisible(true);
            }}
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
            <ActionMenu
                isVisible={isActionMenuVisible}
                onDeleteCalendar={handleDeleteCalendar}
                onTestButton={handleTestAction}
                onClose={() => setIsActionMenuVisible(false)}
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