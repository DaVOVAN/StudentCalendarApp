// src/screens/CalendarSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useAuth } from '../contexts/AuthContext';
import MainButton from '../components/MainButton';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import api from '../api/client';

type CalendarSettingsScreenRouteProp = RouteProp<RootStackParamList, 'CalendarSettings'>;
type CalendarSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CalendarSettings'>;

interface Props {
  navigation: CalendarSettingsScreenNavigationProp;
  route: CalendarSettingsScreenRouteProp;
}

const CalendarSettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { calendarId } = route.params;
  const { colors } = useTheme();
  const { deleteCalendar, syncCalendars } = useCalendar();
  const { user } = useAuth();
  const [mentorVisibility, setMentorVisibility] = useState(true);
  const [allowGuests, setAllowGuests] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/calendars/${calendarId}/settings`);
        setMentorVisibility(response.data.mentor_visibility);
        setAllowGuests(response.data.allow_guests);
      } catch (error) {
        setError('Не удалось загрузить настройки');
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [calendarId]);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await api.put(`/calendars/${calendarId}/settings`, {
        mentor_visibility: mentorVisibility,
        allow_guests: allowGuests
      });
      navigation.goBack();
    } catch (error) {
      setError('Не удалось сохранить настройки');
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Удаление календаря',
      'Вы уверены, что хотите удалить этот календарь?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: () => {
            Alert.alert(
              'Окончательное подтверждение',
              'Текущая версия приложения не предусматривает восстановление удаленных данных. Вы уверены, что хотите продолжить?',
              [
                { text: 'Отмена', style: 'cancel' },
                {
                  text: 'Удалить',
                  onPress: async () => {
                    await deleteCalendar(calendarId);
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    });
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Text style={[styles.errorText, { color: colors.emergency }]}>{error}</Text>
        <MainButton
          title="Повторить"
          onPress={() => {
            setError(null);
            const loadSettings = async () => {
              setIsLoading(true);
              try {
                const response = await api.get(`/calendars/${calendarId}/settings`);
                setMentorVisibility(response.data.mentor_visibility);
                setAllowGuests(response.data.allow_guests);
                setError(null);
              } catch (error) {
                setError('Не удалось загрузить настройки');
              } finally {
                setIsLoading(false);
              }
            };
            loadSettings();
          }}
          icon="refresh"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Видимость для наставников
          </Text>
          <Switch
            value={mentorVisibility}
            onValueChange={setMentorVisibility}
            trackColor={{ false: colors.border, true: colors.accent }}
            disabled={isSaving}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Доступ для гостей
          </Text>
          <Switch
            value={allowGuests}
            onValueChange={setAllowGuests}
            trackColor={{ false: colors.border, true: colors.accent }}
            disabled={isSaving}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonGroup}>
        <MainButton
          title="Сохранить настройки"
          onPress={handleSaveSettings}
          icon="save"
          disabled={isSaving}
          style={styles.saveButton}
        />

        <MainButton
          title="Удалить календарь"
          onPress={handleDelete}
          icon="delete-forever"
          style={[styles.deleteButton, { backgroundColor: colors.emergency }]}
          textStyle={{ color: colors.text }}
        />
      </View>

      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingBottom: 20,
  },
  saveButton: {
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 10,
  },
});

export default CalendarSettingsScreen;