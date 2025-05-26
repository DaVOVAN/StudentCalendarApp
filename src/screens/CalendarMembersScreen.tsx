// src/screens/CalendarMembersScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCalendar } from '../contexts/CalendarContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import api from '../api/client';
import * as Clipboard from 'expo-clipboard';
import { CalendarMember } from '../types/types';
import { translateRole, UserRole } from '../utils/roleUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import MainButton from '../components/MainButton';
import { useAuth } from '../contexts/AuthContext';

const CalendarMembersScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'CalendarMembers'>>();
  const [members, setMembers] = useState<CalendarMember[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [selectedMember, setSelectedMember] = useState<CalendarMember | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { calendarId } = route.params;
  const { user: currentUser } = useAuth();
  
  const currentUserRole = members.find(m => m.userId === currentUser?.id)?.role || 'guest';

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

  const handleRoleChange = async (newRole: UserRole) => {
    try {
      await api.put(`/calendars/${calendarId}/members/${selectedMember?.userId}`, {
        role: newRole
      });
      await loadData();
      setShowRoleModal(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить роль');
    }
  };

  const handleRemoveUser = async () => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены что хотите удалить участника?',
      [
        { text: 'Отмена' },
        {
          text: 'Удалить',
          onPress: async () => {
            await api.delete(`/calendars/${calendarId}/members/${selectedMember?.userId}`);
            await loadData();
            setShowRoleModal(false);
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderMemberItem = ({ item }: { item: CalendarMember }) => {
    const isCurrentUser = item.userId === currentUser?.id;
    const isClickable = ['owner', 'editor'].includes(currentUserRole) && 
                      item.role !== 'owner' && 
                      !isCurrentUser;
    
    return (
      <TouchableOpacity 
        onPress={() => isClickable && (setSelectedMember(item), setShowRoleModal(true))}
        activeOpacity={isClickable ? 0.7 : 1}
      >
        <View style={[styles.memberItem, { 
          backgroundColor: colors.secondary,
          opacity: item.role === 'guest' ? 0.8 : 1
        }]}>
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, { color: colors.text }]}>
              {item.displayName}
              {isCurrentUser && ' (Вы)'}
            </Text>
            <Text style={{ color: colors.secondaryText, fontSize: 12 }}>
              {translateRole(item.role)}
            </Text>
          </View>
          
          {isClickable && (
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        renderItem={renderMemberItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={showRoleModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowRoleModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.roleModalContent, { 
                backgroundColor: colors.primary,
                shadowColor: colors.text
              }]}>
                <Text style={[styles.modalTitle, { 
                  color: colors.text,
                  fontSize: 20,
                  marginBottom: 24
                }]}>
                  Управление участником
                </Text>

                {selectedMember?.role !== 'guest' && (
                  <>
                    <View style={[styles.pickerContainer, { 
                      backgroundColor: colors.secondary,
                      borderRadius: 8,
                      marginBottom: 16
                    }]}>
                      <Picker
                        selectedValue={selectedMember?.role}
                        onValueChange={(value) => setSelectedMember(prev => 
                          prev ? {...prev, role: value} : prev)}
                        style={{ color: colors.text }}
                        dropdownIconColor={colors.text}
                        enabled={currentUserRole === 'owner'}
                      >
                        <Picker.Item label="Участник" value="member" />
                        <Picker.Item label="Редактор" value="editor" />
                        <Picker.Item label="Наставник" value="mentor" />
                      </Picker>
                    </View>

                    <MainButton
                      title="Сменить роль"
                      onPress={() => handleRoleChange(selectedMember?.role as UserRole)}
                      disabled={selectedMember?.role === members.find(m => m.userId === selectedMember?.userId)?.role}
                      style={{ marginBottom: 24 }}
                    />
                  </>
                )}

                <View style={[styles.separator, { 
                  backgroundColor: colors.border,
                  marginVertical: 8
                }]} />

                <MainButton
                  title="Удалить из календаря"
                  onPress={handleRemoveUser}
                  style={{ backgroundColor: colors.emergency }}
                  textStyle={{ color: colors.text }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  memberInfo: {
    flex: 1,
    marginRight: 16,
  },
  memberName: {
    fontSize: 16,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  roleModalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  separator: {
    height: 1,
  },
  pickerContainer: {
    overflow: 'hidden',
  },
});

export default CalendarMembersScreen;