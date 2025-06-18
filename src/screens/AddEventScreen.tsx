// src/screens/AddEventScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Switch, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { EventType } from '../types/types';
import { Picker } from '@react-native-picker/picker';
import MainButton from '../components/MainButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, setMinutes, isAfter } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { CalendarEvent } from '../types/types';
import api from '../api/client';

const roundMinutes = (date: Date) => setMinutes(date, Math.round(date.getMinutes() / 5) * 5);

interface AddEventScreenProps {
    route: RouteProp<RootStackParamList, 'AddEvent'> & {
        params: {
            isEdit?: boolean;
            initialData?: Partial<CalendarEvent>;
        }
    };
}

const AddEventScreen: React.FC<AddEventScreenProps> = ({ route }) => {
    const { colors } = useTheme();
    const { calendars, addEvent, updateEvent, deleteEvent, syncEvents } = useCalendar();
    const navigation = useNavigation();

    const { calendarId, selectedDate, isShared, eventId, isEdit, initialData } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState<EventType>('lab');
    const [location, setLocation] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [links, setLinks] = useState(['']);
    const [dateError, setDateError] = useState<string | null>(null);
    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
    const [isCalendarsCollapsed, setIsCalendarsCollapsed] = useState(true);
    
    const defaultDate = new Date(selectedDate || Date.now());
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [startTime, setStartTime] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [endTime, setEndTime] = useState<Date | undefined>();
    const [pickerConfig, setPickerConfig] = useState<{
        type: 'start' | 'end';
        mode: 'date' | 'time';
        visible: boolean;
    }>({ type: 'start', mode: 'date', visible: false });

    useFocusEffect(
    useCallback(() => {
        const initializeForm = () => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setEventType(initialData.type || 'lab');
            setLocation(initialData.location || '');
            setIsEmergency(initialData.is_emergency || false);
            setLinks(initialData.links?.length ? initialData.links : ['']);
            
            // Инициализация дат
            if (initialData.attach_to_end && initialData.end_datetime) {
            const endDate = new Date(initialData.end_datetime);
            setEndDate(endDate);
            setEndTime(endDate);
            setStartDate(undefined);
            setStartTime(undefined);
            } else if (initialData.start_datetime) {
            const startDate = new Date(initialData.start_datetime);
            setStartDate(startDate);
            setStartTime(startDate);
            
            if (initialData.end_datetime) {
                const endDate = new Date(initialData.end_datetime);
                setEndDate(endDate);
                setEndTime(endDate);
            }
            }
        } else {
            const defaultDate = new Date(selectedDate || Date.now());
            if (eventType === 'lab') {
            const newEnd = roundMinutes(new Date(defaultDate));
            newEnd.setDate(newEnd.getDate() + 1);
            setEndDate(newEnd);
            setEndTime(newEnd);
            } else {
            const newStart = roundMinutes(new Date(defaultDate));
            setStartDate(newStart);
            setStartTime(newStart);
            }
        }
        };

        initializeForm();
    }, [initialData, selectedDate, eventType])
    );

    const combineDateTime = (date: Date | undefined, time: Date | undefined) => {
    if (!date || !time) return undefined;
    
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    
    return roundMinutes(combined);
    };

    const validateDates = () => {
        const start = combineDateTime(startDate, startTime);
        const end = combineDateTime(endDate, endTime);
        
        if (start && end && isAfter(start, end)) {
            setDateError('Дата начала не может быть позже даты окончания');
            return false;
        }
        setDateError(null);
        return true;
    };

    const handleDateTimeChange = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;
        
        const rounded = roundMinutes(selectedDate);
        const { type, mode } = pickerConfig;

        if (type === 'start') {
            if (mode === 'date') setStartDate(rounded);
            else setStartTime(rounded);
        } else {
            if (mode === 'date') setEndDate(rounded);
            else setEndTime(rounded);
        }

        setPickerConfig({ ...pickerConfig, visible: false });
    };

    const toggleCalendarsVisibility = () => {
        setIsCalendarsCollapsed(!isCalendarsCollapsed);
    };

    const toggleCalendarSelection = (calendarId: string) => {
        setSelectedCalendars(prev => 
            prev.includes(calendarId)
                ? prev.filter(id => id !== calendarId)
                : [...prev, calendarId]
        );
    };

    const handleAddLink = useCallback(() => {
        setLinks([...links, '']);
    }, [links]);

    const handleLinkChange = useCallback((text: string, index: number) => {
        const newLinks = [...links];
        newLinks[index] = text;
        setLinks(newLinks);
    }, [links]);

    const renderDateTimeControls = (type: 'start' | 'end') => {
        const currentDate = type === 'start' ? startDate : endDate;
        const currentTime = type === 'start' ? startTime : endTime;
        const label = type === 'start' ? 'Начало' : 'Окончание';

        return (
            <View style={[styles.dateBlock, { backgroundColor: colors.secondary }]}>
                <View style={styles.dateHeader}>
                    <Text style={[styles.dateLabel, { color: colors.text }]}>{label}</Text>
                    {(currentDate || currentTime) && (
                        <TouchableOpacity 
                            onPress={() => {
                                if (type === 'start') {
                                    setStartDate(undefined);
                                    setStartTime(undefined);
                                } else {
                                    setEndDate(undefined);
                                    setEndTime(undefined);
                                }
                            }}
                            style={styles.clearButton}>
                            <MaterialIcons name="close" size={16} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
                
                <View style={styles.datetimeContainer}>
                    <TouchableOpacity
                        onPress={() => setPickerConfig({
                            type,
                            mode: 'date',
                            visible: true
                        })}
                        style={[styles.dateButton, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.dateButtonText, { color: colors.text }]}>
                            {currentDate 
                                ? format(currentDate, 'dd.MM.yyyy')
                                : 'Выбрать дату'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setPickerConfig({
                            type,
                            mode: 'time',
                            visible: true
                        })}
                        style={[styles.dateButton, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.dateButtonText, { color: colors.text }]}>
                            {currentTime 
                                ? format(currentTime, 'HH:mm')
                                : 'Выбрать время'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const handleAddEvent = useCallback(async () => {
        if (!validateDates()) return;

        const start = combineDateTime(startDate, startTime);
        const end = combineDateTime(endDate, endTime);
        const attachToEnd = !!end && !start;

        const eventData = {
            title: title.trim(),
            description: description.trim() || undefined,
            type: eventType,
            location: location.trim() || undefined,
            start_datetime: start?.toISOString(),
            end_datetime: end?.toISOString(),
            links: links.filter(link => link.trim()),
            is_emergency: isEmergency,
            attach_to_end: attachToEnd,
            calendar_id: calendarId
        };

        try {
            if (isEdit && eventId) {
            await api.put(`/events/${eventId}`, eventData);
            await syncEvents(calendarId!);
            } else {
            const targetCalendars = isShared ? selectedCalendars : [calendarId as string];
            await Promise.all(
                targetCalendars.map(calId => 
                api.post('/events', { ...eventData, calendar_id: calId })
                )
            );
            }
            navigation.goBack();
            
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert(
            'Ошибка', 
            isEdit 
                ? 'Не удалось обновить событие' 
                : 'Не удалось создать событие'
            );
        }
    }, [
    startDate, startTime, endDate, endTime,
    title, description, eventType, location,
    links, isEmergency, selectedCalendars,
    calendarId, isShared, isEdit, eventId,
    navigation, validateDates
    ]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={[styles.container, { backgroundColor: colors.primary }]}
                keyboardShouldPersistTaps="handled"
            >
                {isShared && (
                    <View style={[styles.calendarsContainer, { 
                        borderColor: colors.border,
                        backgroundColor: colors.secondary
                    }]}>
                        <TouchableOpacity 
                            style={[styles.collapseHeader, {
                                borderBottomWidth: isCalendarsCollapsed ? 0 : 1,
                                borderColor: colors.border
                            }]}
                            onPress={toggleCalendarsVisibility}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <MaterialIcons 
                                    name={isCalendarsCollapsed ? 'unfold-more' : 'unfold-less'} 
                                    size={20} 
                                    color={colors.text} 
                                />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Выбор календарей
                                </Text>
                            </View>
                            <View style={[styles.counterBadge, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.counterText, { color: colors.accentText }]}>
                                    {selectedCalendars.length}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        
                        {!isCalendarsCollapsed && (
                            <View style={{ paddingHorizontal: 8 }}>
                                {calendars.map((calendar) => (
                                    <TouchableOpacity
                                        key={calendar.id}
                                        style={[
                                            styles.calendarItem,
                                            {
                                                borderLeftColor: selectedCalendars.includes(calendar.id) 
                                                    ? colors.accent 
                                                    : 'transparent',
                                                backgroundColor: selectedCalendars.includes(calendar.id)
                                                    ? `${colors.accent}20`
                                                    : 'transparent'
                                            }
                                        ]}
                                        onPress={() => toggleCalendarSelection(calendar.id)}
                                    >
                                        <MaterialIcons
                                            name={selectedCalendars.includes(calendar.id) 
                                                ? 'check-box' 
                                                : 'check-box-outline-blank'}
                                            size={24}
                                            color={selectedCalendars.includes(calendar.id)
                                                ? colors.accent
                                                : colors.text}
                                        />
                                        <Text style={[
                                            styles.calendarText,
                                            { 
                                                color: selectedCalendars.includes(calendar.id)
                                                    ? colors.secondaryText
                                                    : colors.text
                                            }
                                        ]}>
                                            {calendar.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                <TextInput
                    style={[styles.input, { 
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.secondary
                    }]}
                    placeholder="Название"
                    placeholderTextColor={colors.secondaryText}
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[styles.descriptionInput, { 
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.secondary
                    }]}
                    placeholder="Описание"
                    placeholderTextColor={colors.secondaryText}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <View style={[styles.pickerContainer, { 
                    borderColor: colors.border,
                    backgroundColor: colors.secondary
                }]}>
                    <Picker
                        selectedValue={eventType}
                        onValueChange={setEventType}
                        dropdownIconColor={colors.text}
                        style={{ color: colors.text }}
                    >
                        <Picker.Item label="Лабораторная работа" value="lab" />
                        <Picker.Item label="Контрольная точка" value="checkpoint" />
                        <Picker.Item label="Итоговая работа" value="final" />
                        <Picker.Item label="Собрание" value="meeting" />
                        <Picker.Item label="Конференция" value="conference" />
                        <Picker.Item label="Общественное мероприятие" value="public_event" />
                        <Picker.Item label="Комиссия" value="commission" />
                        <Picker.Item label="Другое" value="other" />
                    </Picker>
                </View>

                {(eventType === 'meeting' || eventType === 'conference' || eventType === 'public_event' || eventType === 'commission' || eventType === 'other') && (
                    <TextInput
                        style={[styles.input, { 
                            borderColor: colors.border,
                            color: colors.text,
                            backgroundColor: colors.secondary
                        }]}
                        placeholder="Место"
                        placeholderTextColor={colors.secondaryText}
                        value={location}
                        onChangeText={setLocation}
                    />
                )}

                <View style={styles.dateSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Время события
                    </Text>

                    <View style={styles.dateGroup}>
                        {renderDateTimeControls('start')}
                        {renderDateTimeControls('end')}
                    </View>

                    {dateError && (
                        <Text style={[styles.errorText, { color: colors.emergency }]}>
                            {dateError}
                        </Text>
                    )}

                    {pickerConfig.visible && (
                        <DateTimePicker
                            value={pickerConfig.type === 'start' 
                                ? (pickerConfig.mode === 'date' ? startDate : startTime) || defaultDate
                                : (pickerConfig.mode === 'date' ? endDate : endTime) || defaultDate}
                            mode={pickerConfig.mode}
                            display="spinner"
                            onChange={(_, date) => handleDateTimeChange(date)}
                        />
                    )}
                </View>

                <View style={[styles.linksSection, { 
                    borderColor: colors.border,
                    backgroundColor: colors.secondary
                }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Ссылки
                    </Text>
                    {links.map((link, index) => (
                        <View key={index} style={styles.linkItem}>
                            <TextInput
                                style={[styles.linkInput, { 
                                    borderColor: colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.primary
                                }]}
                                placeholder="Ссылка"
                                placeholderTextColor={colors.secondaryText}
                                value={link}
                                onChangeText={(text) => handleLinkChange(text, index)}
                            />
                        </View>
                    ))}
                    <TouchableOpacity 
                        onPress={handleAddLink} 
                        style={[styles.addLinkButton, {backgroundColor: colors.primary}]}
                    >
                        <Text style={[styles.addLinkText, { color: colors.accent }]}>
                            Добавить ссылку
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.emergencySection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Чрезвычайное событие
                    </Text>
                    <Switch
                        trackColor={{ false: colors.border, true: colors.emergency }}
                        thumbColor={isEmergency ? colors.accentText : colors.text}
                        ios_backgroundColor={colors.border}
                        onValueChange={setIsEmergency}
                        value={isEmergency}
                    />
                </View>

                <MainButton
                    title="Сохранить"
                    onPress={handleAddEvent}
                    icon="save"
                    style={{ backgroundColor: colors.accent }}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    descriptionInput: {
        height: 120,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingTop: 12,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    dateSection: {
        marginBottom: 24,
    },
    dateGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    dateBlock: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
    },
    datetimeContainer: {
        gap: 8,
    },
    dateButton: {
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    dateButtonText: {
        fontSize: 16,
    },
    linksSection: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 24,
        padding: 16,
    },
    linkItem: {
        marginBottom: 8,
    },
    linkInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    addLinkButton: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    addLinkText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emergencySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    errorText: {
        fontSize: 16,
        marginTop: 8,
    },
    calendarsContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden'
    },
    collapseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    calendarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 16,
        borderLeftWidth: 4,
        marginBottom: 4,
        borderRadius: 4,
    },
    calendarText: {
        fontSize: 16,
        marginLeft: 8,
    },
    counterBadge: {
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    counterText: {
        fontSize: 12,
        fontWeight: 'bold',
    }
});

export default AddEventScreen;