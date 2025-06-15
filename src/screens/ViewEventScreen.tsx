// src/screens/ViewEventScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Linking, Alert } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '../api/client';
import { translateEventType, getEventIcon } from '../utils/eventUtils';
import { TouchableOpacity } from 'react-native';
import { EventType } from '../types/types';
import { useCalendar } from '../contexts/CalendarContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

type EventDetails = {
  id: string;
  title: string;
  type: EventType;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  description?: string;
  links?: string[];
  is_emergency: boolean;
  attach_to_end: boolean;
};

const ViewEventScreen: React.FC<{ route: RouteProp<RootStackParamList, 'ViewEvent'> }> = ({ route }) => {
  const { calendarId, eventId } = route.params;
  const { colors } = useTheme();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { deleteEvent } = useCalendar();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { calendars, syncEvents } = useCalendar();
  const calendar = calendars.find(c => c.id === route.params.calendarId);
  const { user } = useAuth();
  const role = calendar?.role || 'guest';


  const handleDelete = async () => {
    Alert.alert(
      'Удаление события',
      'Вы уверены, что хотите удалить это событие?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (calendarId && event) {
                await deleteEvent(calendarId, event.id);
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить событие');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    if (!event) return;
    
    navigation.navigate('AddEvent', { 
      eventId: event.id,
      calendarId,
      isEdit: true,
      initialData: {
        title: event.title,
        description: event.description,
        type: event.type,
        location: event.location,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
        links: event.links,
        is_emergency: event.is_emergency,
        attach_to_end: event.attach_to_end
      }
    });
  };

    const fetchEvent = async () => {
      try {
        console.log('Fetching event with ID:', eventId);
        const response = await api.get(`/events/${eventId}`);
        console.log('API Response:', response.data);
        
        if (!response.data) throw new Error('Событие не найдено');
        
        const processedEvent: EventDetails = {
          id: response.data.id,
          title: response.data.title,
          type: response.data.event_type,
          start_datetime: response.data.start_datetime,
          end_datetime: response.data.end_datetime,
          location: response.data.location,
          description: response.data.description,
          links: response.data.links,
          is_emergency: response.data.is_emergency,
          attach_to_end: response.data.attach_to_end
        };
        
        setEvent(processedEvent);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    };

  const markAsSeen = async () => {
    if (!eventId) return;
    try {
      await api.post(`/events/${eventId}/mark-seen`);
      if (calendarId) {
        await syncEvents(calendarId);
      }
    } catch (error) {
      console.error('Ошибка при отметке события:', error);
    }
  };

  useEffect(() => {
    fetchEvent();
    markAsSeen();
  }, [eventId]);

    useFocusEffect(
      useCallback(() => {
          fetchEvent();
      }, [eventId])
    );

  const formatSafeDate = (dateString?: string | null) => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Некорректная дата';
      
      return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
    } catch {
      return 'Некорректный формат даты';
    }
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
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Событие не найдено</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { backgroundColor: colors.primary }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentWrapper}>
        {/* Заголовок */}
        <View style={styles.header}>
          {/* Левая часть с контентом */}
          <View style={styles.headerContent}>
            <MaterialIcons 
              name={getEventIcon(event.type)} 
              size={28}
              color={colors.accent} 
              style={styles.eventIcon}
            />
            
            <View style={styles.titleContainer}>
              <Text 
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {event.title}
              </Text>
              
              {event.is_emergency && (
                <View style={[styles.emergencyBadge, { backgroundColor: colors.emergency }]}>
                  <MaterialIcons name="warning" size={14} color={colors.accentText} />
                  <Text style={[styles.emergencyText, { color: colors.accentText }]}>Важное</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={handleEdit}
              disabled={user?.isGuest || role === 'member'}
              style={styles.actionButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={24} color={(user?.isGuest || role === 'member') ? colors.secondaryText : colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleDelete}
              disabled={user?.isGuest || role === 'member'}
              style={styles.actionButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete-outline" size={24} color={(user?.isGuest || role === 'member') ? colors.secondaryText : colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Информационная панель */}
        <View style={[styles.infoCard, { backgroundColor: colors.secondary }]}>
          {event.attach_to_end ? (
            <>
              <View style={styles.infoRow}>
                <MaterialIcons name="timer-off" size={20} color={colors.text} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {formatSafeDate(event.end_datetime)}
                </Text>
              </View>
              {event.start_datetime && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.infoRow}>
                    <MaterialIcons name="calendar-today" size={20} color={colors.text} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      {formatSafeDate(event.start_datetime)}
                    </Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <MaterialIcons name="calendar-today" size={20} color={colors.text} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {formatSafeDate(event.start_datetime)}
                </Text>
              </View>
              {event.end_datetime && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.infoRow}>
                    <MaterialIcons name="timer-off" size={20} color={colors.text} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      {formatSafeDate(event.end_datetime)}
                    </Text>
                  </View>
                </>
              )}
            </>
          )}
        </View>

        {/* Детали */}
        {event.location && (
          <Section title="Место проведения" icon="place">
            <Text style={[styles.detailText, { color: colors.text }]}>{event.location}</Text>
          </Section>
        )}

        {event.description && (
          <Section title="Описание" icon="description">
            <Text style={[styles.detailText, { color: colors.text }]}>{event.description}</Text>
          </Section>
        )}

        {event.links && event.links.length > 0 && (
          <Section title="Ссылки" icon="link">
            {event.links.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(link.startsWith('http') ? link : `https://${link}`)}
                style={styles.linkItem}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name="launch" 
                  size={20} 
                  color={colors.secondaryText} 
                  style={styles.linkIcon}
                />
                <Text 
                  style={[styles.linkText, { color: colors.secondaryText }]}
                  numberOfLines={1}
                >
                  {link}
                </Text>
              </TouchableOpacity>
            ))}
          </Section>
        )}
      </View>
    </ScrollView>
  );
};

const Section: React.FC<{ 
  title: string; 
  icon: keyof typeof MaterialIcons.glyphMap;
  children: React.ReactNode 
}> = ({ title, icon, children }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons 
          name={icon} 
          size={24} 
          color={colors.text} 
          style={styles.sectionIcon}
        />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      <View style={[styles.sectionContent, { backgroundColor: colors.secondary }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  contentWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    paddingTop: 4,
  },
  actionButton: {
    padding: 4,
  },
  eventIcon: {
    marginRight: 16,
    top: 7,
    marginBottom: 'auto'
    
  },
  titleWrapper: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    marginRight: 8,
    marginTop: 4
  },
  controlsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emergencyBadge: {
    marginTop: 3,
    marginRight: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionContent: {
    borderRadius: 12,
    padding: 16,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkIcon: {
    marginRight: 12,
  },
  linkText: {
    fontSize: 16,
    flex: 1,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ViewEventScreen;