//src/utils/eventUtils.ts
import { EventType } from '../types/types';
import { MaterialIcons } from '@expo/vector-icons';

export const translateEventType = (type: EventType): string => {
  switch (type) {
    case 'lab': return 'Лабораторная работа';
    case 'checkpoint': return 'Контрольная точка';
    case 'final': return 'Итоговая работа';
    case 'meeting': return 'Собрание';
    case 'conference': return 'Конференция';
    case 'commission': return 'Комиссия';
    case 'other': return 'Другое';
    default: return 'Неизвестно';
  }
};

export const getEventIcon = (type: EventType): keyof typeof MaterialIcons.glyphMap => {
  switch (type) {
    case 'lab': return 'science';
    case 'checkpoint': return 'assignment';
    case 'final': return 'gavel';
    case 'meeting': return 'groups';
    case 'conference': return 'record-voice-over';
    case 'commission': return 'account-balance';
    case 'other': return 'event';
    default: return 'event';
  }
};