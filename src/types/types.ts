// src/types/types.ts
export interface Calendar {
  id: string;
  name: string;
  color: string;
  events: CalendarEvent[];
}

export type EventType = 'laboratory' | 'checkpoint' | 'final' | 'meeting_teacher' | 'meeting_tutor' | 'deadline' | 'commission';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  links: string[];
  eventType: EventType;
  location?: string;
  isEmergency?: boolean;
}

export type Theme = 'light' | 'dark' | 'pink' | 'ocean' | 'forest';