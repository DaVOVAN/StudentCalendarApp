// src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { globalStyles } from '../styles/globalStyles';
import MainButton from '../components/MainButton';
import { Calendar } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import ActionMenu from '../components/ActionMenu';
import { MaterialIcons } from '@expo/vector-icons';

interface HomeScreenProps {
    navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [newCalendarName, setNewCalendarName] = useState('');
    const { calendars, addCalendar, deleteCalendar } = useCalendar();
    const { theme, setTheme, styles, colors } = useTheme();
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
    const [showAddCalendarModal, setShowAddCalendarModal] = useState(false);

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
                    { text: "Cancel", style: "cancel" },
                    { text: "OK", onPress: () => {
                        deleteCalendar(selectedCalendarId);
                        setSelectedCalendarId(null);
                        setIsActionMenuVisible(false);
                    }}
                ]
            );
        }
    }, [selectedCalendarId, deleteCalendar]);

    const handleTestAction = useCallback(() => {
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
            <Text style={{ color: colors.text, fontSize: 16 }}>{item.name}</Text>
            <MaterialIcons name="calendar-today" size={20} color={colors.text} />
        </TouchableOpacity>
    ), [navigation, colors]);

    const AddCalendarModal = () => (
        <Modal
            transparent
            visible={showAddCalendarModal}
            onRequestClose={() => setShowAddCalendarModal(false)}
        >
            <TouchableWithoutFeedback onPress={() => setShowAddCalendarModal(false)}>
                <View style={localStyles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={[localStyles.modalContent, { backgroundColor: colors.primary }]}>
                            <Text style={[localStyles.modalTitle, { color: colors.text }]}>New Calendar</Text>
                            <TextInput
                                style={[localStyles.modalInput, { color: colors.text, borderColor: colors.accent }]}
                                placeholder="Calendar name"
                                placeholderTextColor={colors.text}
                                value={newCalendarName}
                                onChangeText={setNewCalendarName}
                                autoFocus
                            />
                            <MainButton
                                title="Create"
                                onPress={() => {
                                    handleAddCalendar();
                                    setShowAddCalendarModal(false);
                                }}
                                icon="check"
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
            <MainButton 
                title="Add Calendar" 
                onPress={() => setShowAddCalendarModal(true)}
                icon="add"
            />
            
            <MainButton 
                title={`Toggle Theme (${theme})`} 
                onPress={handleToggleTheme} 
                icon="brightness-6"
            />

            <FlatList
                data={calendars}
                keyExtractor={item => item.id}
                renderItem={renderCalendarItem}
                contentContainerStyle={localStyles.listContent}
            />

            <ActionMenu
                isVisible={isActionMenuVisible}
                onDeleteCalendar={handleDeleteCalendar}
                onTestButton={handleTestAction}
                onClose={() => setIsActionMenuVisible(false)}
            />

            <AddCalendarModal />
        </View>
    );
};

const localStyles = StyleSheet.create({
    calendarItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        elevation: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
});

export default HomeScreen;