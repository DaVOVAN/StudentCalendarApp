// src/screens/HomeScreen.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { globalStyles } from '../styles/globalStyles';
import MainButton from '../components/MainButton';
import { Calendar } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import ActionMenu from '../components/ActionMenu';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {
    navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { calendars, addCalendar, deleteCalendar } = useCalendar();
    const { colors } = useTheme();
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
    const [showAddCalendarModal, setShowAddCalendarModal] = useState(false);
    const insets = useSafeAreaInsets();

    const handleDeleteCalendar = useCallback(() => {
        if (selectedCalendarId) {
            Alert.alert(
                "Удаление календаря",
                "Вы уверены, что хотите удалить этот календарь?",
                [
                    { text: "Отмена", style: "cancel" },
                    { 
                        text: "Удалить", 
                        onPress: () => {
                            deleteCalendar(selectedCalendarId);
                            setSelectedCalendarId(null);
                            setIsActionMenuVisible(false);
                        }
                    }
                ]
            );
        }
    }, [selectedCalendarId, deleteCalendar]);

    const AddCalendarModal = () => {
        const [inputValue, setInputValue] = useState('');
        const textInputRef = useRef<TextInput>(null);

        const handleSubmit = useCallback(() => {
            if (inputValue.trim()) {
                addCalendar(inputValue);
                setInputValue('');
                setShowAddCalendarModal(false);
            }
        }, [inputValue, addCalendar]);

        return (
            <Modal
                transparent
                visible={showAddCalendarModal}
                onRequestClose={() => setShowAddCalendarModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowAddCalendarModal(false)}>
                    <View style={[localStyles.modalOverlay, { paddingTop: insets.top }]}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={localStyles.keyboardAvoid}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                        >
                            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                <View style={[localStyles.modalContent, { backgroundColor: colors.primary }]}>
                                    <TextInput
                                        ref={textInputRef}
                                        style={[localStyles.modalInput, { 
                                            color: colors.text,
                                            borderColor: colors.accent
                                        }]}
                                        placeholder="Название календаря"
                                        placeholderTextColor={colors.secondaryText}
                                        value={inputValue}
                                        onChangeText={setInputValue}
                                        onSubmitEditing={handleSubmit}
                                        autoFocus
                                    />
                                    <MainButton
                                        title="Создать"
                                        onPress={handleSubmit}
                                        icon="check"
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    };

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

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
            <MainButton 
                title="Создать календарь" 
                onPress={() => setShowAddCalendarModal(true)}
                icon="add"
            />
            
            <MainButton 
                title="Создать общее событие"
                onPress={() => navigation.navigate('AddEvent', { isShared: true })}
                icon="event"
            />

            <MainButton 
                title="Выбрать тему" 
                onPress={() => navigation.navigate('ThemeSelection')}
                icon="palette"
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    keyboardAvoid: {
        width: '100%',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxHeight: '80%',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
});

export default HomeScreen;