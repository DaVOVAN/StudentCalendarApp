// src/components/ActionMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface ActionMenuProps {
    isVisible: boolean;
    onAddEvent?: () => void;
    onDeleteCalendar?: () => void;
    onClearDate?: (date: Date) => void;
    onTestButton?: () => void;
    onClose: () => void;
    hasEvents?: boolean;
    selectedDate?: Date | null;
    onAddTestEvent?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ 
    isVisible, 
    onAddEvent, 
    onDeleteCalendar,
    onClearDate,
    onTestButton,
    onClose,
    hasEvents,
    selectedDate,
    onAddTestEvent
}) => {
    const { colors } = useTheme();

    const menuItems = [
        ...(onAddEvent ? [{
            label: 'Добавить событие', 
            icon: 'add' as const,
            handler: () => onAddEvent(), // Обработчик без параметров
            color: colors.accent
        }] : []),
        ...(onClearDate && hasEvents && selectedDate ? [{
            label: 'Очистить дату',
            icon: 'clear' as const,
            handler: () => onClearDate(selectedDate), // Передаем дату здесь
            color: colors.emergency
        }] : []),
        ...(onDeleteCalendar ? [{
            label: 'Удалить календарь', 
            icon: 'delete' as const,
            handler: () => onDeleteCalendar(),
            color: colors.emergency
        }] : []),
        ...(onTestButton ? [{
            label: 'Тестовая команда', 
            icon: 'code' as const,
            handler: () => onTestButton(),
            color: colors.text
        }] : []),
        ...(onAddTestEvent ? [{
            label: 'Быстрое тестовое событие', 
            icon: 'bolt' as const,
            handler: () => onAddTestEvent(),
            color: colors.accent
        }] : [])
    ];

    return (
        <Modal transparent visible={isVisible} animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
                    <View style={[styles.menuContainer, { 
                        backgroundColor: colors.secondary,
                        shadowColor: colors.text
                    }]}>
                        {menuItems.map((item, index) => (
                            <React.Fragment key={item.label}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        item.handler();
                                        onClose();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons 
                                        name={item.icon} 
                                        size={24} 
                                        color={item.color} 
                                        style={styles.icon} 
                                    />
                                    <Text style={[styles.menuText, { 
                                        color: item.color,
                                        marginLeft: 12 
                                    }]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                                {index !== menuItems.length - 1 && (
                                    <View style={[styles.separator, { 
                                        backgroundColor: colors.border 
                                    }]} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        width: '80%',
        borderRadius: 16,
        paddingVertical: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginHorizontal: 16,
    },
    icon: {
        width: 28,
        textAlign: 'center',
    },
});

export default ActionMenu;