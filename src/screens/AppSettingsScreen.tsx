// src/screens/AppSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import * as Clipboard from 'expo-clipboard';
import api from '../api/client';

const AppSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [mentorCode, setMentorCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadMentorCode = async () => {
    try {
      const response = await api.get('/users/mentor-code');
      setMentorCode(response.data.code);
    } catch (error) {
      console.error('Ошибка загрузки кода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateCode = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/users/regenerate-mentor-code');
      setMentorCode(response.data.code);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить код');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(mentorCode);
  };

  useEffect(() => {
    loadMentorCode();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.text }]}>Настройки приложения</Text>
      
      <View style={[styles.codeContainer, { backgroundColor: colors.secondary }]}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <>
            <Text style={[styles.codeText, { color: colors.text }]}>{mentorCode}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={copyToClipboard} style={styles.iconButton}>
                <MaterialIcons name="content-copy" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={regenerateCode} style={styles.iconButton}>
                <MaterialIcons name="autorenew" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      
      <Text style={[styles.description, { color: colors.secondaryText }]}>
        По этому коду вас могут добавить в календарь в качестве наставника
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default AppSettingsScreen;