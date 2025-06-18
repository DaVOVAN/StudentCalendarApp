// src/types/types.ts
import { UserRole } from '../utils/roleUtils';

export interface Calendar {
  id: string;
  name: string;
  events: CalendarEvent[];
  ownerId?: string;
  role: UserRole;
  settings?: {
    mentorVisibility: boolean;
    allowGuests: boolean;
  };
  unseenCount?: number;
}

export type EventType = 'lab' | 'checkpoint' | 'final' | 'meeting' | 'conference' | 'public_event' | 'commission' | 'other';

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
  is_seen?: boolean;
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