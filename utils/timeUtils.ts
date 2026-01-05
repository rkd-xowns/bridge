
import { Location } from '../types';

export const getTimeInZone = (zone: Location) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24h format as requested
  }).format(new Date());
};

export const getHourInZoneAtUTC = (utcDate: Date, zone: Location) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(utcDate), 10);
};

// Generates an array of 49 Date objects starting from 00:00 in the specified zone
// Includes 24:00 (the 49th slot)
export const generate30MinSlots = (baseDate: Date, zone: Location) => {
  // Get date components in the target zone to find the start of the local day
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(baseDate);
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;

  // Create a UTC date for the start of the calendar day
  const utcStart = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  
  // Calculate the offset in minutes at that specific time in that zone
  const getOffset = (date: Date, tz: string) => {
    const base = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const target = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    return (base.getTime() - target.getTime()) / 60000;
  };
  
  const offsetMinutes = getOffset(utcStart, zone);
  const start = new Date(utcStart.getTime() + offsetMinutes * 60000);

  return Array.from({ length: 49 }, (_, i) => {
    return new Date(start.getTime() + i * 30 * 60000);
  });
};

export const formatTimeOnly = (date: Date, zone: Location) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export const formatFullDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

/**
 * Get the current timezone abbreviation (e.g., EST, EDT, KST)
 */
export const getTimezoneAbbreviation = (zone: Location): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    timeZoneName: 'short'
  });
  const parts = formatter.formatToParts(new Date());
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value;
  return tzName || (zone === Location.KOREA ? 'KST' : 'EST/EDT');
};
