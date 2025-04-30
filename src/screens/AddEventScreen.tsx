// src/screens/AddEventScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { EventType } from '../types/types';
import { Picker } from '@react-native-picker/picker'; // Import Picker
// yarn add @react-native-picker/picker

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
    const [eventType, setEventType] = useState<EventType>('laboratory');
    const [location, setLocation] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);

    const eventTypes: { label: string; value: EventType }[] = [
        { label: 'Laboratory Work', value: 'laboratory' },
        { label: 'Checkpoint', value: 'checkpoint' },
        { label: 'Final Assessment', value: 'final' },
        { label: 'Meeting with Teacher', value: 'meeting_teacher' },
        { label: 'Meeting with Tutor', value: 'meeting_tutor' },
        { label: 'Important Deadline', value: 'deadline' },
        { label: 'Commission', value: 'commission' },
    ];

    const showLocationField = eventType === 'meeting_teacher' || eventType === 'meeting_tutor' || eventType === 'checkpoint' || eventType === 'final' || eventType === 'commission';

    const handleAddLink = useCallback(() => {
        setLinks([...links, '']);
    }, [links]);

    const handleLinkChange = useCallback((text: string, index: number) => {
        const newLinks = [...links];
        newLinks[index] = text;
        setLinks(newLinks);
    }, [links]);

    const handleAddEvent = useCallback(() => {
        const eventData = {
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            links: links,
            eventType: eventType,
            ...(showLocationField ? { location: location } : {}), // Conditionally add location
            isEmergency: isEmergency, // Add isEmergency
        };

        addEvent(calendarId, eventData);
        navigation.goBack();
    }, [calendarId, title, description, startDate, endDate, links, eventType, location, isEmergency, addEvent, navigation, showLocationField]);

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

            <Text style={{ color: colors.text }}>Event Type:</Text>
            <Picker
                style={{ color: colors.text, width: '100%' }}
                selectedValue={eventType}
                onValueChange={(itemValue: EventType) => setEventType(itemValue)}
            >
                {eventTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
            </Picker>
            {showLocationField && (
                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.text }]}
                    placeholder="Location"
                    placeholderTextColor={colors.text}
                    value={location}
                    onChangeText={setLocation}
                />
            )}

            <View style={styles.emergencyContainer}>
                <Text style={{ color: colors.text }}>Emergency:</Text>
                <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isEmergency ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setIsEmergency}
                    value={isEmergency}
                />
            </View>

            <Text style={{ color: colors.text }}>Links:</Text>
            {links.map((link, index) => (
                <TextInput
                    key={index}
                    style={[styles.input, { color: colors.text, borderColor: colors.text }]}
                    placeholder="Link"
                    placeholderTextColor={colors.text}
                    value={link}
                    onChangeText={(text) => handleLinkChange(text, index)} />
                ))
            }
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
        emergencyContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
        }
    });
    
    export default AddEventScreen;