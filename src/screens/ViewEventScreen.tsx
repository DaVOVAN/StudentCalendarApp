// src/screens/ViewEventScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Linking, ScrollView } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

interface ViewEventScreenProps {
    route: RouteProp<RootStackParamList, 'ViewEvent'>;
}

const ViewEventScreen: React.FC<ViewEventScreenProps> = ({ route }) => {
    const { calendarId, eventId } = route.params;
    const { calendars } = useCalendar();
    const { colors } = useTheme();

    const calendar = calendars.find(c => c.id === calendarId);
    const event = calendar?.events.find(e => e.id === eventId);
    const validLinks = event?.links.filter(link => link.trim() !== '') || [];

    const handleLinkPress = (url: string) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        Linking.openURL(url).catch(() => {
            alert('Could not open the URL');
        });
    };

    if (!event) {
        return (
            <View style={[styles.container, { backgroundColor: colors.primary }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>Event not found</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            contentContainerStyle={[styles.container, { backgroundColor: colors.primary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
                {event.isEmergency && (
                    <View style={[styles.emergencyBadge, { backgroundColor: colors.emergency }]}>
                        <Text style={styles.emergencyText}>Urgent</Text>
                    </View>
                )}
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Date & Time */}
                <View style={styles.section}>
                    {event.startDate && (
                        <View style={styles.row}>
                            <MaterialIcons 
                                name="calendar-today" 
                                size={20} 
                                color={colors.accent} 
                                style={styles.icon}
                            />
                            <Text style={[styles.label, { color: colors.secondaryText }]}>
                                {format(new Date(event.startDate), 'EEE, MMM d · HH:mm')}
                            </Text>
                        </View>
                    )}
                    {event.endDate && (
                        <View style={styles.row}>
                            <MaterialIcons 
                                name="timer" 
                                size={20} 
                                color={colors.accent} 
                                style={styles.icon}
                            />
                            <Text style={[styles.label, { color: colors.secondaryText }]}>
                                {format(new Date(event.endDate), 'EEE, MMM d · HH:mm')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Event Details */}
                <View style={styles.divider} />

                <View style={styles.section}>
                    <DetailRow 
                        icon="description" 
                        label="Description" 
                        value={event.description}
                        color={colors.accent}
                        textColor={colors.text}
                    />
                    
                    <DetailRow 
                        icon="category" 
                        label="Type" 
                        value={event.eventType}
                        color={colors.accent}
                        textColor={colors.text}
                    />

                    {event.location && (
                        <DetailRow 
                            icon="place" 
                            label="Location" 
                            value={event.location}
                            color={colors.accent}
                            textColor={colors.text}
                        />
                    )}
                </View>

                {/* Links Section */}
                {validLinks.length > 0 && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Links</Text>
                            {validLinks.map((link, index) => (
                                <View key={index} style={styles.linkContainer}>
                                    <MaterialIcons 
                                        name="link" 
                                        size={16} 
                                        color={colors.accent} 
                                        style={styles.icon}
                                    />
                                    <Text 
                                        style={[styles.linkText, { color: colors.accent }]}
                                        onPress={() => handleLinkPress(link)}
                                    >
                                        {link}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const DetailRow = ({ icon, label, value, color, textColor }: any) => (
    <View style={styles.detailRow}>
        <MaterialIcons 
            name={icon} 
            size={18} 
            color={color} 
            style={styles.icon}
        />
        <View style={styles.detailText}>
            <Text style={[styles.detailLabel, { color: textColor }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 24,
        position: 'relative',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        lineHeight: 34,
        marginRight: 100,
    },
    emergencyBadge: {
        position: 'absolute',
        right: 0,
        top: 4,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    emergencyText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
    },
    content: {
        backgroundColor: '#FFFFFF10',
        borderRadius: 16,
        padding: 20,
    },
    section: {
        marginVertical: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    icon: {
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#FFFFFF20',
        marginVertical: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 12,
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        marginBottom: 4,
        opacity: 0.8,
    },
    detailValue: {
        fontSize: 16,
        lineHeight: 22,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    linkText: {
        fontSize: 16,
        textDecorationLine: 'underline',
        flexShrink: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 40,
    },
});

export default ViewEventScreen;