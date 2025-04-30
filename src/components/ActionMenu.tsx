//src/components/ActionMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <View style={styles.actionMenu}>
      {onAddEvent && (
        <TouchableOpacity style={styles.actionButton} onPress={onAddEvent}>
          <Text>Add Event</Text>
        </TouchableOpacity>
      )}
      {onDeleteCalendar && (
        <TouchableOpacity style={styles.actionButton} onPress={onDeleteCalendar}>
          <Text>Delete Calendar</Text>
        </TouchableOpacity>
      )}
      {onTestButton && (
        <TouchableOpacity style={styles.actionButton} onPress={onTestButton}>
          <Text>Test Button</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.actionButton} onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
});

export default ActionMenu;