// src/screens/EventListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent, EventType } from '../types/types';
import MainButton from '../components/MainButton';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/client';
import { ru } from 'date-fns/locale';
import { translateEventType, getEventIcon } from '../utils/eventUtils';
import { useAuth } from '../contexts/AuthContext';

const EventListScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'EventList'>>();
    const { colors, styles: themeStyles } = useTheme();
    const [safeDate, setSafeDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { calendars } = useCalendar();

    const { calendarId, selectedDate: rawDate } = route.params || {};
    
    useEffect(() => {
        if (!calendarId || !rawDate) {
            navigation.goBack();
            Alert.alert('Ошибка', 'Недостаточно данных');
            return;
        }

        if (isNaN(new Date(rawDate).getTime())) {
            navigation.goBack();
            Alert.alert('Ошибка', 'Некорректная дата');
            return;
        }
        setSafeDate(new Date(rawDate));
    }, [rawDate]);

    const calendar = calendars.find(c => c.id === calendarId);
    const role = calendar?.role || 'guest';
    const isRestrictedView = 
        role === 'mentor' && 
        calendar?.settings?.mentorVisibility === false;

    const loadEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            if (!safeDate || !calendarId) return;

            const response = await api.get(`/calendars/${calendarId}/events`);
            
            const filteredEvents = response.data
            .filter((event: any) => {
                let eventDate;
                if (event.attach_to_end && event.end_datetime) {
                eventDate = event.end_datetime;
                } else if (event.start_datetime) {
                eventDate = event.start_datetime;
                } else {
                return false;
                }
                return isSameDay(new Date(eventDate), safeDate);
            })
            .map(({ event_type, ...rest }: any) => ({
                ...rest,
                type: event_type,
                id: rest.id,
                title: rest.title,
                start_datetime: rest.start_datetime,
                end_datetime: rest.end_datetime,
                links: rest.links || [],
                is_emergency: rest.is_emergency || false,
                attach_to_end: rest.attach_to_end || false
            }));

            setEvents(filteredEvents);
        } catch (err) {
            setError('Не удалось загрузить события');
        } finally {
            setIsLoading(false);
        }
    }, [calendarId, safeDate]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    useFocusEffect(
        React.useCallback(() => {
        loadEvents();
        }, [calendarId, safeDate, loadEvents])
    );

const renderItem = useCallback(({ item }: { item: CalendarEvent }) => {
    const eventDate = item.attach_to_end && item.end_datetime 
        ? item.end_datetime 
        : item.start_datetime;

    if (!eventDate) return null;

    return (
        <TouchableOpacity 
            onPress={() => navigation.navigate('ViewEvent', { 
                calendarId: calendarId!, 
                eventId: item.id 
            })}
            activeOpacity={0.9}
        >
            <View style={[
                styles.eventItem, { 
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    shadowColor: colors.text
                }
            ]}>
                <View style={styles.iconContainer}>
                    <MaterialIcons 
                        name={getEventIcon(item.type)} 
                        size={24} 
                        color={colors.accent} 
                    />
                </View>
                
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text 
                            style={[styles.title, { color: colors.text }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.title}
                        </Text>
                        {item.is_emergency && (
                            <View style={[
                                styles.emergencyBadge, 
                                { backgroundColor: colors.accent }
                            ]}>
                                <Text style={[styles.emergencyText, {color: colors.accentText}]}>Важное</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.details}>
                        <MaterialIcons 
                            name="access-time" 
                            size={14} 
                            color={colors.secondaryText} 
                        />
                        <Text style={[styles.time, { color: colors.secondaryText }]}>
                            {format(new Date(eventDate), 'HH:mm')}
                            {item.end_datetime && ` - ${format(new Date(item.end_datetime), 'HH:mm')}`}
                        </Text>
                    </View>
                    
                    <View style={styles.typeContainer}>
                        <Text style={[
                            styles.typeText, 
                            { 
                                color: colors.text + '60',
                                backgroundColor: colors.accent + '40' 
                            }
                        ]}>
                            {translateEventType(item.type)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}, [colors, calendarId, navigation]);

    if (!safeDate) return null;

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.primary }]}>
                <Text style={[styles.errorText, { color: colors.emergency }]}>{error}</Text>
                <MainButton
                    title="Повторить попытку"
                    onPress={loadEvents}
                    icon="refresh"
                    style={{ marginTop: 16 }}
                />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
            {isRestrictedView && (
                <View style={[
                    styles.restrictedBanner, 
                    { backgroundColor: colors.accent + '20' }
                ]}>
                    <MaterialIcons 
                        name="visibility-off" 
                        size={20} 
                        color={colors.text} 
                    />
                    <Text style={[styles.restrictedText, { color: colors.text }]}>
                        Вы видите только свои события
                    </Text>
                </View>
            )}
            
            <Text style={[styles.dateTitle, { color: colors.text }]}>
            {safeDate ? format(safeDate, 'PPP', { locale: ru }) : ''}
            </Text>

            <FlatList
                data={events}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons 
                            name="event-busy" 
                            size={48} 
                            color={colors.secondaryText} 
                        />
                        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                            Событий на этот день нет
                        </Text>
                    </View>
                }
            />

            <View style = {styles.buttonContainer}>
                <MainButton
                    title="Добавить событие"
                    onPress={() => navigation.navigate('AddEvent', { 
                        calendarId: calendarId!, 
                        selectedDate: safeDate.toISOString() 
                    })}
                    icon="add"
                    style={{ 
                        backgroundColor: user?.isGuest ? colors.secondary : colors.accent,
                        opacity: user?.isGuest ? 0.6 : 1,
                    }}
                    textStyle={{ 
                        color: user?.isGuest ? colors.secondaryText : colors.accentText 
                    }}
                    disabled={user?.isGuest}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    buttonContainer: {
        marginBottom: -42
    },
    dateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    eventItem: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        flexDirection: 'row',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    time: {
        fontSize: 14,
        marginLeft: 6,
    },
    typeContainer: {
        alignSelf: 'flex-start',
    },
    typeText: {
        fontSize: 12,
        fontWeight: '500',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        overflow: 'hidden',
    },
    emergencyBadge: {
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    emergencyText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
    restrictedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    restrictedText: {
        marginLeft: 8,
        fontSize: 14,
    }
});

export default EventListScreen;