// src/types/types.ts
export interface Calendar {
  id: string;
  name: string;
  events: CalendarEvent[];
  ownerId?: string;
}

export type EventType = 'laboratory' | 'checkpoint' | 'final' | 'meeting' | 'conference' | 'event' | 'commission' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  links: string[];
  eventType: EventType;
  location?: string;
  isEmergency?: boolean;
  attachToEnd?: boolean;
}

export type Theme = 'light' | 'dark' | 'pink' | 'ocean' | 'forest' | 'military';