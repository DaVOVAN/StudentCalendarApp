import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useAuth } from '../contexts/AuthContext';
import MainButton from '../components/MainButton';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api/client';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get(`/calendars/${calendarId}/settings`);
        setMentorVisibility(response.data.mentor_visibility);
        setAllowGuests(response.data.allow_guests);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, [calendarId]);

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

  const updateSetting = async (setting: string, value: boolean) => {
    try {
      await api.put(`/calendars/${calendarId}/settings`, { [setting]: value });
      if (setting === 'allow_guests' && !value) {
        await api.delete(`/calendars/${calendarId}/guests`);
      }
      await syncCalendars();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.settingText, { color: colors.text }]}>
          Видимость для наставников
        </Text>
        <Switch
          value={mentorVisibility}
          onValueChange={(value) => {
            setMentorVisibility(value);
            updateSetting('mentor_visibility', value);
          }}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>

      <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.settingText, { color: colors.text }]}>
          Доступ для гостей
        </Text>
        <Switch
          value={allowGuests}
          onValueChange={(value) => {
            setAllowGuests(value);
            updateSetting('allow_guests', value);
          }}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>

      <MainButton
        title="Удалить календарь"
        onPress={handleDelete}
        icon="delete-forever"
        style={{ backgroundColor: colors.emergency, marginTop: 40 }}
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
});

export default CalendarSettingsScreen;