// src/types/types.ts
export interface Calendar {
    id: string;
    name: string;
    color: string;
    events: Event[];
  }
  
  export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string; // ISO String
    endDate: string;   // ISO String
    links: string[];
  }
  
  export type Theme = 'light' | 'dark' | 'pink';