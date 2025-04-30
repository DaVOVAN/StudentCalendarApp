// src/components/ActionMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ActionMenuProps {
    isVisible: boolean;
    onAddEvent?: () => void;
    onDeleteCalendar?: () => void;
    onTestButton?: () => void;
    onClose: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ 
    isVisible, 
    onAddEvent, 
    onDeleteCalendar, 
    onTestButton, 
    onClose 
}) => {
    const { colors, styles } = useTheme();

    return (
        <Modal transparent visible={isVisible} animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
                    <View style={[styles.menu, { backgroundColor: colors.secondary }]}>
                        {onAddEvent && (
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={onAddEvent}
                            >
                                <Text style={{ color: colors.text }}>Add Event</Text>
                            </TouchableOpacity>
                        )}
                        {onDeleteCalendar && (
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={onDeleteCalendar}
                            >
                                <Text style={{ color: colors.text }}>Delete Calendar</Text>
                            </TouchableOpacity>
                        )}
                        {onTestButton && (
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={onTestButton}
                            >
                                <Text style={{ color: colors.text }}>Test Button</Text>
                            </TouchableOpacity>
                        )}
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
    },
    menu: {
        borderRadius: 12,
        padding: 8,
        minWidth: 200,
        elevation: 4,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
});

export default ActionMenu;