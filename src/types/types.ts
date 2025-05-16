// src/types/types.ts
import { UserRole } from '../utils/roleUtils';

export interface Calendar {
  id: string;
  name: string;
  events: CalendarEvent[];
  ownerId?: string;
  role: UserRole;
}

export type EventType = 'lab' | 'checkpoint' | 'final' | 'meeting' | 'conference' | 'commission' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime?: string | null;
  end_datetime?: string | null;
  links: string[];
  type: EventType;
  location?: string;
  is_emergency?: boolean;
  attach_to_end: boolean;
  sync_status?: 'synced' | 'pending';
}

export type Theme = 'light' | 'dark' | 'pink' | 'ocean' | 'forest' | 'military';

export interface CalendarInvite {
  code: string;
  expiresAt: string;
}

export interface CalendarMember {
  userId: string;
  displayName: string;
  role: UserRole;
}