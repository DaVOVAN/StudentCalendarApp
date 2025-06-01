import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import * as Clipboard from 'expo-clipboard';
import MainButton from '../components/MainButton';

const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const [mentorCode, setMentorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMentorCode = async () => {
    if (!user || user.isGuest) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/calendars/mentor-code`);
      setMentorCode(response.data.code);
    } catch (error) {
      console.log('Ошибка получения кода наставника:', error);
      setMentorCode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMentorCode = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(`/calendars/mentor-code`);
      setMentorCode(response.data.code);
      Alert.alert('Успешно', 'Код наставника создан');
    } catch (error) {
      console.log('Ошибка генерации кода:', error);
      Alert.alert('Ошибка', 'Не удалось создать код наставника');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (mentorCode) {
      await Clipboard.setStringAsync(mentorCode);
      Alert.alert('Скопировано', 'Код наставника скопирован в буфер');
    }
  };

  useEffect(() => {
    fetchMentorCode();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={[styles.section, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Код наставника
        </Text>
        
        {isLoading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Загрузка...
          </Text>
        ) : mentorCode ? (
          <View style={styles.codeContainer}>
            <Text style={[styles.codeText, { color: colors.text }]}>
              {mentorCode}
            </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <MaterialIcons 
                name="content-copy" 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.noCodeText, { color: colors.secondaryText }]}>
            Код не создан
          </Text>
        )}
        
        <MainButton
          title={mentorCode ? "Сгенерировать новый код" : "Создать код наставника"}
          onPress={generateMentorCode}
          icon="vpn-key"
          style={{ marginTop: 16 }}
          disabled={isLoading}
        />
        
        <Text style={[styles.hint, { color: colors.secondaryText }]}>
          Поделитесь этим кодом с учениками, чтобы они могли добавить вас как наставника в свои календари
        </Text>
      </View>

      <MainButton
        title="Выйти"
        onPress={logout}
        icon="exit-to-app"
        style={{ backgroundColor: colors.emergency, marginTop: 24 }}
        textStyle={{ color: colors.text }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  noCodeText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  },
  hint: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default SettingsScreen;