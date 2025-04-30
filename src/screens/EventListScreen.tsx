// src/screens/EventListScreen.tsx
import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { format } from 'date-fns';
import { CalendarEvent } from '../types/types';
import MainButton from '../components/MainButton';

interface EventListScreenProps {
    route: RouteProp<RootStackParamList, 'EventList'>;
}

const EventListScreen: React.FC<EventListScreenProps> = ({ route }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { calendarId, selectedDate } = route.params;
    const { calendars } = useCalendar();
    const { colors, styles } = useTheme();

    const calendar = calendars.find(c => c.id === calendarId);
    const eventsForDate = calendar?.events.filter(event => 
        format(new Date(event.endDate), 'yyyy-MM-dd') === format(new Date(selectedDate), 'yyyy-MM-dd')
    ) || [];

    const handleAddEvent = useCallback(() => {
        navigation.navigate('AddEvent', { calendarId, selectedDate });
    }, [calendarId, selectedDate, navigation]);

    const handleViewEvent = useCallback((eventId: string) => {
        navigation.navigate('ViewEvent', { calendarId, eventId });
    }, [calendarId, navigation]);

    const renderItem = useCallback(({ item }: { item: CalendarEvent }) => (
        <MainButton
            title={item.title}
            onPress={() => handleViewEvent(item.id)}
            style={localStyles.eventItem}
            textStyle={{ color: colors.text }}
            icon="event"
        />
    ), [handleViewEvent, colors]);

    return (
        <View style={[localStyles.container, { backgroundColor: colors.primary }]}>
            <Text style={[localStyles.dateTitle, { color: colors.text }]}>
                {format(new Date(selectedDate), 'PPP')}
            </Text>

            <FlatList
                data={eventsForDate}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={localStyles.list}
            />

            <MainButton
                title="Add Event"
                onPress={handleAddEvent}
                icon="add"
                style={{ backgroundColor: colors.accent }}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    dateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    eventItem: {
        marginVertical: 8,
        paddingVertical: 16,
    },
    list: {
        paddingBottom: 20,
    },
});

export default EventListScreen;