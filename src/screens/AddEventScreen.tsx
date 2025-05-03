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
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { EventType } from '../types/types';
import { Picker } from '@react-native-picker/picker';
import MainButton from '../components/MainButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, setMinutes, isAfter } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

const roundMinutes = (date: Date) => setMinutes(date, Math.round(date.getMinutes() / 5) * 5);

interface AddEventScreenProps {
    route: RouteProp<RootStackParamList, 'AddEvent'>;
}

const AddEventScreen: React.FC<AddEventScreenProps> = ({ route }) => {
    const { colors, styles } = useTheme();
    const { calendarId, selectedDate, isShared } = route.params;
    const { addEvent, calendars } = useCalendar();
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState<EventType>('laboratory');
    const [location, setLocation] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [links, setLinks] = useState(['']);
    const [visiblePicker, setVisiblePicker] = useState<'startDate'|'startTime'|'endDate'|'endTime'|null>(null);
    const [attachToEnd, setAttachToEnd] = useState(false);
    const [dateError, setDateError] = useState<string | null>(null);
    const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
    const [isCalendarsCollapsed, setIsCalendarsCollapsed] = useState(true);
    
    const defaultDate = new Date(selectedDate || Date.now());
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [startTime, setStartTime] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [endTime, setEndTime] = useState<Date | undefined>();

    useEffect(() => {
        if(eventType === 'laboratory') {
            const newEnd = roundMinutes(new Date(defaultDate));
            newEnd.setDate(newEnd.getDate() + 1);
            setEndDate(newEnd);
            setEndTime(newEnd);
            setStartDate(undefined);
            setStartTime(undefined);
            setAttachToEnd(true);
        } else {
            const newStart = roundMinutes(new Date(defaultDate));
            setStartDate(newStart);
            setStartTime(newStart);
            setEndDate(undefined);
            setEndTime(undefined);
            setAttachToEnd(false);
        }
    }, [eventType]);

    useEffect(() => {
        if(startDate && endDate) {
            setAttachToEnd(false);
        } else if(endDate) {
            setAttachToEnd(true);
        } else {
            setAttachToEnd(false);
        }
    }, [startDate, endDate]);

    const validateDates = () => {
        if (startDate && endDate && isAfter(startDate, endDate)) {
            setDateError('Дата начала не может быть позже даты окончания');
            return false;
        }
        setDateError(null);
        return true;
    };

    const handleDateTimeChange = (event: any, date?: Date) => {
        setVisiblePicker(null);
        if (!date) return;

        const roundedDate = roundMinutes(date);
        switch(visiblePicker) {
            case 'startDate': setStartDate(roundedDate); break;
            case 'startTime': setStartTime(roundedDate); break;
            case 'endDate': setEndDate(roundedDate); break;
            case 'endTime': setEndTime(roundedDate); break;
        }
    };

    const clearDate = (type: 'start' | 'end') => {
        if (type === 'start') {
            setStartDate(undefined);
            setStartTime(undefined);
        } else {
            setEndDate(undefined);
            setEndTime(undefined);
        }
    };

    const handleAddLink = useCallback(() => {
        setLinks([...links, '']);
    }, [links]);

    const handleLinkChange = useCallback((text: string, index: number) => {
        const newLinks = [...links];
        newLinks[index] = text;
        setLinks(newLinks);
    }, [links]);

    const toggleCalendarSelection = (calendarId: string) => {
        setSelectedCalendars(prev => 
            prev.includes(calendarId)
                ? prev.filter(id => id !== calendarId)
                : [...prev, calendarId]
        );
    };

    const toggleCalendarsVisibility = () => {
        setIsCalendarsCollapsed(!isCalendarsCollapsed);
    };

    const handleAddEvent = useCallback(() => {
        if (!validateDates()) return;
        if (!title.trim()) {
            Alert.alert('Ошибка', 'Название события обязательно');
            return;
        }
        if (isShared && selectedCalendars.length === 0) {
            Alert.alert('Ошибка', 'Выберите хотя бы один календарь');
            return;
        }

        const finalAttachToEnd = endDate ? attachToEnd : false;
        const baseDate = finalAttachToEnd ? endDate : startDate;

        if(!baseDate) {
            Alert.alert('Ошибка', 'Необходимо выбрать хотя бы одну дату');
            return;
        }

        const eventData = {
            title,
            description,
            startDate: startDate?.toISOString(),
            startTime: startTime ? format(startTime, 'HH:mm') : undefined,
            endDate: endDate?.toISOString(),
            endTime: endTime ? format(endTime, 'HH:mm') : undefined,
            links: links.filter(link => link.trim()),
            eventType,
            location: location || undefined,
            isEmergency,
            attachToEnd: finalAttachToEnd
        };

        const targetCalendars = isShared ? selectedCalendars : [calendarId as string];
        targetCalendars.forEach(calId => {
            const eventWithUniqueId = { 
                ...eventData, 
                id: Date.now().toString() + '-' + calId 
            };
            addEvent(calId, eventWithUniqueId);
        });
        
        navigation.goBack();
    }, [startDate, endDate, startTime, endTime, title, description, links, eventType, location, isEmergency, selectedCalendars]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={[localStyles.container, { backgroundColor: colors.primary }]}
                keyboardShouldPersistTaps="handled"
            >
                {isShared && (
                    <View style={[localStyles.calendarsContainer, { 
                        borderColor: colors.border,
                        backgroundColor: colors.secondary
                    }]}>
                        <TouchableOpacity 
                            style={[localStyles.collapseHeader, {
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
                                <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                                    Выбор календарей
                                </Text>
                            </View>
                            <View style={[localStyles.counterBadge, { backgroundColor: colors.accent }]}>
                                <Text style={[localStyles.counterText, { color: colors.accentText }]}>
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
                                            localStyles.calendarItem,
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
                                            localStyles.calendarText,
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
                    style={[localStyles.input, { 
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
                    style={[localStyles.descriptionInput, { 
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

                <View style={[localStyles.pickerContainer, { 
                    borderColor: colors.border,
                    backgroundColor: colors.secondary
                }]}>
                    <Picker
                        selectedValue={eventType}
                        onValueChange={setEventType}
                        dropdownIconColor={colors.text}
                        style={{ 
                            color: colors.text,
                            backgroundColor: colors.secondary
                        }}
                        itemStyle={{
                            color: colors.text,
                            backgroundColor: colors.secondary
                        }}
                    >
                        <Picker.Item label="Лабораторная работа" value="laboratory" style={{ color: colors.text, backgroundColor: colors.secondary }}  />
                        <Picker.Item label="Контрольная точка" value="checkpoint" style={{ color: colors.text, backgroundColor: colors.secondary }} />
                        <Picker.Item label="Итоговая работа" value="final" style={{ color: colors.text, backgroundColor: colors.secondary }} />
                        <Picker.Item label="Собрание" value="meeting" style={{ color: colors.text, backgroundColor: colors.secondary }} />
                        <Picker.Item label="Конференция" value="conference" style={{ color: colors.text, backgroundColor: colors.secondary }} />
                        <Picker.Item label="Общественное мероприятие" value="event" style={{ color: colors.text, backgroundColor: colors.secondary }} />
                        <Picker.Item label="Комиссия" value="commission" style={{ color: colors.text, backgroundColor: colors.secondary }} />
                        <Picker.Item label="Другое" value="other" style={{ color: colors.text, backgroundColor: colors.secondary }} />
                    </Picker>
                </View>

                {(eventType === 'meeting' || eventType === 'conference') && (
                    <TextInput
                        style={[localStyles.input, { 
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

                <View style={localStyles.dateSection}>
                    <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                        Время события
                    </Text>

                    <View style={localStyles.dateGroup}>
                        <View style={[localStyles.dateBlock, { backgroundColor: colors.secondary }]}>
                            <View style={localStyles.dateHeader}>
                                <Text style={[localStyles.dateLabel, { color: colors.text }]}>
                                    Начало
                                </Text>
                                {startDate && (
                                    <TouchableOpacity 
                                        onPress={() => clearDate('start')}
                                        style={localStyles.clearButton}>
                                        <MaterialIcons name="close" size={16} color={colors.text} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => setVisiblePicker('startDate')}
                                style={localStyles.dateButton}>
                                <Text style={[localStyles.dateButtonText, { color: colors.text }]}>
                                    {startDate ? format(startDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setVisiblePicker('startTime')}
                                style={localStyles.dateButton}>
                                <Text style={[localStyles.dateButtonText, { color: colors.text }]}>
                                    {startTime ? format(startTime, 'HH:mm') : 'Выбрать время'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[localStyles.dateBlock, { backgroundColor: colors.secondary }]}>
                            <View style={localStyles.dateHeader}>
                                <Text style={[localStyles.dateLabel, { color: colors.text }]}>
                                    Окончание
                                </Text>
                                {endDate && (
                                    <TouchableOpacity 
                                        onPress={() => clearDate('end')}
                                        style={localStyles.clearButton}>
                                        <MaterialIcons name="close" size={16} color={colors.text} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => setVisiblePicker('endDate')}
                                style={localStyles.dateButton}>
                                <Text style={[localStyles.dateButtonText, { color: colors.text }]}>
                                    {endDate ? format(endDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setVisiblePicker('endTime')}
                                style={localStyles.dateButton}>
                                <Text style={[localStyles.dateButtonText, { color: colors.text }]}>
                                    {endTime ? format(endTime, 'HH:mm') : 'Выбрать время'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {startDate && endDate && (
                        <View style={[localStyles.attachRow, { backgroundColor: colors.secondary }]}>
                            <Text style={[localStyles.attachLabel, { color: colors.text }]}>
                                Прикрепить к:
                            </Text>
                            <TouchableOpacity
                                onPress={() => setAttachToEnd(false)}
                                style={[
                                    localStyles.attachButton,
                                    !attachToEnd && { backgroundColor: colors.accent }
                                ]}>
                                <Text style={[localStyles.attachButtonText, !attachToEnd && { color: colors.accentText }]}>
                                    Началу
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setAttachToEnd(true)}
                                style={[
                                    localStyles.attachButton,
                                    attachToEnd && { backgroundColor: colors.accent }
                                ]}>
                                <Text style={[localStyles.attachButtonText, attachToEnd && { color: colors.accentText }]}>
                                    Концу
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {dateError && (
                        <Text style={[localStyles.errorText, { color: colors.emergency }]}>
                            {dateError}
                        </Text>
                    )}
                </View>

                {visiblePicker && (
                    <DateTimePicker
                        value={
                            visiblePicker === 'startDate' ? startDate || new Date() :
                            visiblePicker === 'startTime' ? startTime || new Date() :
                            visiblePicker === 'endDate' ? endDate || new Date() :
                            endTime || new Date()
                        }
                        mode={visiblePicker.includes('Date') ? 'date' : 'time'}
                        minuteInterval={5}
                        display="spinner"
                        onChange={handleDateTimeChange}
                    />
                )}

                <View style={[localStyles.switchContainer, { 
                    borderColor: colors.border,
                    backgroundColor: colors.secondary
                }]}>
                    <Text style={[localStyles.switchLabel, { color: colors.text }]}>Срочное</Text>
                    <Switch
                        trackColor={{ false: colors.secondaryText, true: colors.accent }}
                        thumbColor={colors.text}
                        value={isEmergency}
                        onValueChange={setIsEmergency}
                    />
                </View>

                {links.map((link, index) => (
                    <TextInput
                        key={index}
                        style={[localStyles.input, { 
                            borderColor: colors.border,
                            color: colors.text,
                            backgroundColor: colors.secondary
                        }]}
                        placeholder={`Ссылка #${index + 1}`}
                        placeholderTextColor={colors.secondaryText}
                        value={link}
                        onChangeText={(text) => handleLinkChange(text, index)}
                    />
                ))}

                <View style={localStyles.buttonsContainer}>
                    <MainButton
                        title="Добавить ссылку"
                        onPress={handleAddLink}
                        icon="link"
                        style={{ backgroundColor: colors.accent }}
                        textStyle={{ color: colors.accentText }}
                    />
                    <MainButton
                        title="Создать"
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
    dateSection: {
        marginVertical: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    dateGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    dateBlock: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
    },
    dateButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 4,
    },
    dateButtonText: {
        fontSize: 14,
    },
    attachRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        padding: 12,
        gap: 8,
    },
    attachLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    attachButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    attachButtonText: {
        fontSize: 14,
    },
    errorText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    calendarsContainer: {
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 8,
        overflow: 'hidden',
    },
    collapseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 14,
    },
    counterBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    counterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    calendarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 12,
        borderLeftWidth: 4,
        borderRadius: 4,
        marginVertical: 4,
    },
    calendarText: {
        fontSize: 16,
        flex: 1,
    },
});

export default AddEventScreen;