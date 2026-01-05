
import { CalendarEvent, DailyHighlight, DailyFeeling } from '../types';

// Using a reliable public API for shared JSON storage
const API_BASE = 'https://jsonblob.com/api/jsonBlob';
// This is a fresh, dedicated ID for Taejun and Yuju. 
// If this ever fails, the app will fallback to local-only until fixed.
const FIXED_BLOB_ID = '1342571212873318400'; 

export interface SharedData {
  events: CalendarEvent[];
  highlights: Record<string, DailyHighlight>;
  feelings: DailyFeeling[];
  names: {
    me: string;
    partner: string;
  };
  lastUpdated: string;
}

export const updateBridge = async (code: string, data: SharedData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${FIXED_BLOB_ID}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (err) {
    // Silently log for developer but don't break the app
    console.warn('Sync Push Failed (Network):', err);
    return false;
  }
};

export const getBridgeData = async (code: string): Promise<SharedData | null> => {
  try {
    const response = await fetch(`${API_BASE}/${FIXED_BLOB_ID}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      if (response.status === 404) console.error('Bridge ID not found on server.');
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn('Sync Pull Failed (Network):', err);
    return null;
  }
};

export const mergeData = (local: any[], remote: any[]) => {
  const combined = [...local];
  remote.forEach(remoteItem => {
    if (!combined.find(localItem => localItem.id === remoteItem.id)) {
      combined.push(remoteItem);
    }
  });
  // Filter out any duplicates that might have slipped in
  return Array.from(new Map(combined.map(item => [item.id, item])).values());
};
