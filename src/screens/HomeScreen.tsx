// src/screens/HomeScreen.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { globalStyles } from '../styles/globalStyles';
import MainButton from '../components/MainButton';
import { Calendar } from '../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import ActionMenu from '../components/ActionMenu';
import AuthModal from '../components/AuthModal';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InviteModal from '../components/InviteModal';
import { translateRole, UserRole } from '../utils/roleUtils';

interface HomeScreenProps {
    navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { calendars, addCalendar, deleteCalendar, syncCalendars } = useCalendar();
    const { colors } = useTheme();
    const { user, logout, createGuestSession } = useAuth();
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
    const [showAddCalendarModal, setShowAddCalendarModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const insets = useSafeAreaInsets();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { leaveCalendar } = useCalendar();
    const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    console.log("Синхронизация календарей...");
                    await syncCalendars();
                } catch (error) {
                    console.error('Ошибка синхронизации:', error);
                }
            };
            fetchData();
        }, [syncCalendars])
    );

    useEffect(() => {
        const checkAuthStatus = async () => {
            const refreshToken = await AsyncStorage.getItem('@refresh_token');
            if (!refreshToken && user?.isGuest) {
            await createGuestSession();
            }
        };
        checkAuthStatus();
    }, []);

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

    const handleLogout = useCallback(async () => {
        try {
        await logout();
        await syncCalendars();
        } catch (error) {
        console.error('Logout error:', error);
        }
    }, [logout, syncCalendars]);

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
                                        maxLength={25}
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

    const renderAuthStatus = () => (
    <View style={[localStyles.authContainer, { backgroundColor: colors.secondary }]}>
        <Text style={[localStyles.userText, { color: colors.text }]}>
        {user?.displayName || 'Гость'}
        </Text>
        
        {!user?.isGuest ? (
        <MainButton
            title="Выйти"
            onPress={handleLogout}
            icon="exit-to-app"
            style={{ backgroundColor: colors.accent }}
            textStyle={{ color: colors.accentText }}
        />
        ) : (
        <MainButton
            title="Войти"
            onPress={() => setShowAuthModal(true)}
            icon="login"
            style={{ backgroundColor: colors.accent }}
            textStyle={{ color: colors.accentText }}
        />
        )}
    </View>
    );

    const renderCalendarItem = useCallback(({ item }: { item: Calendar }) => {
        const isOwner = item.role === 'owner';
    
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('Calendar', { calendarId: item.id })}
                onLongPress={!isOwner ? () => {
                    setSelectedCalendar(item);
                    setIsActionMenuVisible(true);
                } : undefined}
                style={[localStyles.calendarItem, { 
                backgroundColor: colors.secondary,
                borderLeftWidth: 4,
                borderLeftColor: item.role === 'owner' ? colors.emergency : colors.accent
                }]}
            >
                <View style={{ flex: 1 }}>
                    <Text 
                        style={[localStyles.calendarText, { color: colors.text }]} 
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.name}
                    </Text>
                    <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
                        {translateRole(item.role || 'member')}
                    </Text>
                </View>
                {item.unseenCount && item.unseenCount > 0 ? (
                    <View style={[
                        localStyles.unseenBadge, 
                        { backgroundColor: colors.emergency }
                        ]}>
                        <Text style={localStyles.unseenText}>
                            {item.unseenCount > 9 ? '9+' : item.unseenCount}
                        </Text>
                    </View>
                ) : null}
                <MaterialIcons name="chevron-right" size={24} color={colors.text} />
            </TouchableOpacity>
        );
    }, [colors, navigation]);

    return (
        <View style={[globalStyles.container, { backgroundColor: colors.primary }, localStyles.container]}>
            {renderAuthStatus()}
            
            <FlatList
                data={calendars}
                keyExtractor={item => item.id}
                renderItem={renderCalendarItem}
                contentContainerStyle={localStyles.listContent}
            />
            
            <View style={[localStyles.footerContainer, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                    onPress={() => setShowAddCalendarModal(true)}
                    disabled={user?.isGuest}
                    style={[
                        localStyles.footerButton, 
                        { 
                            backgroundColor: user?.isGuest ? colors.secondary : colors.accent,
                            opacity: user?.isGuest ? 0.6 : 1,
                        }
                    ]}
                >
                    <MaterialIcons name="calendar-month" size={28} color={colors.accentText} />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setShowInviteModal(true)}
                    style={[localStyles.footerButton, {backgroundColor: colors.accent}]}
                >
                    <MaterialIcons name="group-add" size={28} color={colors.accentText} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => navigation.navigate('AddEvent', { isShared: true })}
                    disabled={user?.isGuest}
                    style={[
                        localStyles.footerButton, 
                        { 
                            backgroundColor: user?.isGuest ? colors.secondary : colors.accent,
                            opacity: user?.isGuest ? 0.6 : 1,
                        }
                    ]}
                >
                    <MaterialIcons name="create" size={28} color={colors.accentText} />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate('ThemeSelection')}
                    style={[localStyles.footerButton, {backgroundColor: colors.accent}]}
                >
                    <MaterialIcons name="palette" size={28} color={colors.accentText} />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate('AppSettings')}
                    style={[localStyles.footerButton, {backgroundColor: colors.accent}]}
                >
                    <MaterialIcons name="settings" size={28} color={colors.accentText} />
                </TouchableOpacity>
            </View>

            <ActionMenu
            isVisible={isActionMenuVisible}
            onClose={() => setIsActionMenuVisible(false)}
            onForgetCalendar={() => {
                if (selectedCalendar) {
                leaveCalendar(selectedCalendar.id);
                }
            }}
            userRole={selectedCalendar?.role}
            />

            <AddCalendarModal />
            <AuthModal
                visible={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />

            <InviteModal
                visible={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onJoinSuccess={(calendarId) => {
                    syncCalendars();
                }}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12,
        flex: 1,
    },
    authContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    userText: {
        fontSize: 16,
        fontWeight: '500',
        flexShrink: 1,
        marginRight: 8,
    },
    calendarText: {
        fontSize: 16,
        marginLeft: 0,
        flexShrink: 1,
        maxWidth: '85%'
    },
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
      borderRadius: 16,
      padding: 20,
      elevation: 5,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        maxHeight: 150,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
        flexGrow: 1,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    footerButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unseenBadge: {
        borderRadius: 8,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    unseenText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default HomeScreen;