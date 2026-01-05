
export enum Location {
  KOREA = 'Asia/Seoul',
  GEORGIA = 'America/New_York'
}

export interface UserProfile {
  name: string;
  location: Location;
  role: 'me' | 'partner';
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO string in UTC
  durationMinutes: number;
  type: 'work' | 'sleep' | 'leisure' | 'date' | 'study' | 'other';
  userId: string;
}

export interface DailyHighlight {
  dateKey: string; // Format: YYYY-MM-DD
  title: string;
  color: string;
}

export interface DailyFeeling {
  id: string;
  userId: string;
  text: string;
  emoji: string;
  timestamp: string; // ISO string in UTC
  dateKey: string; // To associate with the calendar date
}

export interface AnalysisResult {
  overlapWindows: { start: string; end: string; quality: string }[];
  suggestions: string[];
  summary: string;
}
