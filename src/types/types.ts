//src/types/types.ts
export interface Calendar {
    id: string;
    name: string;
    color: string;
    events: Event[];
  }
  
  export interface Event {
    id: string;
    date: string;
    title: string;
    description: string;
  }
  
  export type Theme = 'light' | 'dark' | 'pink';