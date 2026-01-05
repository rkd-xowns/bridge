import { supabase } from './supabaseConfig';
import { CalendarEvent, DailyHighlight, DailyFeeling } from '../types';

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

const BRIDGE_ID = 'ldr-taejun-yuju-bridge-v1';
const TABLE_NAME = 'bridges';

/**
 * Initialize the bridges table if it doesn't exist
 * This will be done automatically when you set up Supabase
 */
export const initializeDatabase = async (): Promise<void> => {
  // The table should be created via Supabase SQL editor
  // This is just a helper to ensure the record exists
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id')
    .eq('id', BRIDGE_ID)
    .single();

  if (error && error.code === 'PGRST116') {
    // Record doesn't exist, create it
    await supabase.from(TABLE_NAME).insert({
      id: BRIDGE_ID,
      events: [],
      highlights: {},
      feelings: [],
      names: { me: '태준', partner: '유주' },
      lastUpdated: new Date().toISOString()
    });
  }
};

/**
 * Save data to Supabase
 */
export const saveBridgeData = async (data: SharedData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        id: BRIDGE_ID,
        ...data,
        lastUpdated: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error saving to Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    return false;
  }
};

/**
 * Get data from Supabase (one-time read)
 */
export const getBridgeData = async (): Promise<SharedData | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', BRIDGE_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record doesn't exist yet
        return null;
      }
      console.error('Error reading from Supabase:', error);
      return null;
    }

    if (data) {
      return {
        events: data.events || [],
        highlights: data.highlights || {},
        feelings: data.feelings || [],
        names: data.names || { me: '태준', partner: '유주' },
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error('Error reading from Supabase:', error);
    return null;
  }
};

/**
 * Subscribe to real-time updates from Supabase
 * Returns an unsubscribe function
 */
export const subscribeToBridgeData = (
  callback: (data: SharedData | null) => void
): (() => void) => {
  const channel = supabase
    .channel('bridge-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: TABLE_NAME,
        filter: `id=eq.${BRIDGE_ID}`
      },
      async (payload) => {
        // Fetch the latest data when change occurs
        const latestData = await getBridgeData();
        callback(latestData);
      }
    )
    .subscribe();

  // Also fetch initial data
  getBridgeData().then(callback);

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Merge local and remote data arrays, avoiding duplicates
 */
export const mergeData = (local: any[], remote: any[]): any[] => {
  const combined = [...local];
  remote.forEach(remoteItem => {
    if (!combined.find(localItem => localItem.id === remoteItem.id)) {
      combined.push(remoteItem);
    }
  });
  // Filter out any duplicates that might have slipped in
  return Array.from(new Map(combined.map(item => [item.id, item])).values());
};

