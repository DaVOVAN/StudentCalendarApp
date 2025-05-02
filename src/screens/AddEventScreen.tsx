// src/screens/AddEventScreen.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Switch, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { EventType } from '../types/types';
import { Picker } from '@react-native-picker/picker';
import MainButton from '../components/MainButton';

interface AddEventScreenProps {
    route: RouteProp<RootStackParamList, 'AddEvent'>;
}

const AddEventScreen: React.FC<AddEventScreenProps> = ({ route }) => {
    const { colors, styles } = useTheme();
    const { calendarId, selectedDate } = route.params;
    const { addEvent } = useCalendar();
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState<EventType>('laboratory');
    const [location, setLocation] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [links, setLinks] = useState(['']);

    const eventTypes = [
        { label: 'Лабораторная работа', value: 'laboratory' },
        { label: 'Контрольная точка', value: 'checkpoint' },
        { label: 'Итоговая контрольная работа', value: 'final' },
        { label: 'Собрание', value: 'meeting' },
        { label: 'Конференция', value: 'conference' },
        { label: 'Общественное мероприятие', value: 'event' },
        { label: 'Комиссия', value: 'commission' },
        { label: 'Другое', value: 'Other' },
    ];

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
            title,
            description,
            startDate: selectedDate,
            endDate: selectedDate,
            links: links.filter(link => link.trim()),
            eventType,
            location: location || undefined,
            isEmergency,
        };

        addEvent(calendarId, eventData);
        navigation.goBack();
    }, [calendarId, title, description, links, eventType, location, isEmergency, addEvent, navigation]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={[localStyles.container, { backgroundColor: colors.primary }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Основные поля */}
                <TextInput
                    style={[localStyles.input, { 
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.secondary
                    }]}
                    placeholder="Title"
                    placeholderTextColor={colors.secondaryText}
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[localStyles.descriptionInput, { 
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.secondary
                    }]}
                    placeholder="Description"
                    placeholderTextColor={colors.secondaryText}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                {/* Picker с единым стилем */}
                <View style={[localStyles.pickerContainer, { 
                    borderColor: colors.border,
                    backgroundColor: colors.secondary
                }]}>
                    <Picker
                        selectedValue={eventType}
                        onValueChange={setEventType}
                        dropdownIconColor={colors.text}
                        style={{ color: colors.text }}
                    >
                        {eventTypes.map(type => (
                            <Picker.Item 
                                key={type.value} 
                                label={type.label} 
                                value={type.value} 
                                color={colors.text}
                            />
                        ))}
                    </Picker>
                </View>

                {/* Локация при необходимости */}
                {(eventType === 'meeting' || eventType === 'conference') && (
                    <TextInput
                        style={[localStyles.input, { 
                            borderColor: colors.border,
                            color: colors.text,
                            backgroundColor: colors.secondary
                        }]}
                        placeholder="Location"
                        placeholderTextColor={colors.secondaryText}
                        value={location}
                        onChangeText={setLocation}
                    />
                )}

                {/* Переключатель */}
                <View style={[localStyles.switchContainer, { 
                    borderColor: colors.border,
                    backgroundColor: colors.secondary
                }]}>
                    <Text style={[localStyles.switchLabel, { color: colors.text }]}>Emergency</Text>
                    <Switch
                        trackColor={{ false: colors.secondaryText, true: colors.accent }}
                        thumbColor={colors.text}
                        value={isEmergency}
                        onValueChange={setIsEmergency}
                    />
                </View>

                {/* Ссылки */}
                {links.map((link, index) => (
                    <TextInput
                        key={index}
                        style={[localStyles.input, { 
                            borderColor: colors.border,
                            color: colors.text,
                            backgroundColor: colors.secondary
                        }]}
                        placeholder={`Link #${index + 1}`}
                        placeholderTextColor={colors.secondaryText}
                        value={link}
                        onChangeText={(text) => handleLinkChange(text, index)}
                    />
                ))}

                {/* Кнопки вертикально */}
                <View style={localStyles.buttonsContainer}>
                    <MainButton
                        title="Add Link"
                        onPress={handleAddLink}
                        icon="link"
                        style={{ backgroundColor: colors.accent }}
                        textStyle={{ color: colors.accentText }}
                    />
                    <MainButton
                        title="Create Event"
                        onPress={handleAddEvent}
                        icon="check"
                        style={{ backgroundColor: colors.accent }}
                        textStyle={{ color: colors.accentText }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 40,
        gap: 12,
    },
    input: {
        height: 48,
        fontSize: 16,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    descriptionInput: {
        minHeight: 100,
        fontSize: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    switchLabel: {
        fontSize: 16,
    },
    buttonsContainer: {
        gap: 4,
        marginTop: -4,
    },
});

export default AddEventScreen;