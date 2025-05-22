// src/screens/CalendarMembersScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCalendar } from '../contexts/CalendarContext';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import api from '../api/client';
import * as Clipboard from 'expo-clipboard';
import { CalendarMember } from '../types/types';
import { translateRole, UserRole } from '../utils/roleUtils';

const CalendarMembersScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'CalendarMembers'>>();
  const [members, setMembers] = useState<CalendarMember[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const { calendarId } = route.params;

    const loadData = async () => {
    try {
        const [membersRes, codeRes] = await Promise.all([
        api.get(`/calendars/${calendarId}/members`),
        api.get(`/calendars/${calendarId}/invite`)
        ]);
        
        if (membersRes.data && codeRes.data) {
        setMembers(membersRes.data);
        setInviteCode(codeRes.data.code);
        } else {
        Alert.alert('Ошибка', 'Данные не получены');
        }
        
    } catch (error: any) {
        console.error('Ошибка загрузки:', error.response?.data || error.message);
        Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось загрузить данные');
    }
    };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Успешно', 'Код скопирован в буфер');
  };

  const regenerateCode = async () => {
    try {
      const res = await api.post(`/calendars/${calendarId}/regenerate-code`);
      setInviteCode(res.data.code);
      Alert.alert('Успешно', 'Код обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить код');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={[styles.codeContainer, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.codeText, { color: colors.text }]}>{inviteCode}</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={copyToClipboard} style={styles.iconButton}>
            <MaterialIcons name="content-copy" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={regenerateCode} style={styles.iconButton}>
            <MaterialIcons name="autorenew" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

    <FlatList
    data={members}
    keyExtractor={item => item.userId}
    renderItem={({ item }) => (
        <View style={[styles.memberItem, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.memberName, { color: colors.text }]}>
            {item.displayName}
        </Text>
        <Text style={{ color: colors.secondaryText }}>
            {translateRole(item.role)}
        </Text>
        </View>
    )}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
  },
});

export default CalendarMembersScreen;