// src/components/InviteModal.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api/client';

const InviteModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onJoinSuccess: (calendarId: string) => void;
}> = ({ visible, onClose, onJoinSuccess }) => {
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    try {
      const response = await api.post('/calendars/join', { code });
      onJoinSuccess(response.data.calendarId);
      onClose();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Доступ для гостей закрыт.');
      } else if (err.response?.status === 404) {
        setError('Неверный код или срок действия истек');
      } else {
        setError('Не удалось присоединиться к календарю');
      }
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.primary }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Введите код приглашения
          </Text>
          
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.secondary,
              },
            ]}
            placeholder="7-значный код"
            placeholderTextColor={colors.secondaryText}
            value={code}
            onChangeText={setCode}
            maxLength={7}
            autoCapitalize="characters"
          />

          {error && (
            <Text style={[styles.error, { color: colors.emergency }]}>{error}</Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent }]}
              onPress={handleJoin}>
              <Text style={{ color: colors.accentText }}>Добавить</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={onClose}>
              <Text style={{ color: colors.text }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  error: {
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default InviteModal;