// src/types/types.ts
export interface Calendar {
    id: string;
    name: string;
    color: string;
    events: Event[];
  }
  
  export type EventType = 'laboratory' | 'checkpoint' | 'final' | 'meeting_teacher' | 'meeting_tutor' | 'deadline' | 'commission';
  
  export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    links: string[];
    eventType: EventType;
    location?: string;  // Optional, only needed for certain event types
    isEmergency?: boolean; // Add isEmergency field
  }
  
  export type Theme = 'light' | 'dark' | 'pink' | 'ocean' | 'forest';