
import React, { useRef, useEffect, useState } from 'react';
import { CalendarEvent, Location } from '../types';
import { generate30MinSlots, formatTimeOnly, formatFullDate, isSameDay } from '../utils/timeUtils';

interface SynchronizedTimelineProps {
  myEvents: CalendarEvent[];
  partnerEvents: CalendarEvent[];
  myLocation: Location;
  partnerLocation: Location;
  currentUser: 'me' | 'partner';
  selectedDate: Date;
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
}

const SynchronizedTimeline: React.FC<SynchronizedTimelineProps> = ({ 
  myEvents, 
  partnerEvents, 
  myLocation, 
  partnerLocation,
  currentUser,
  selectedDate,
  onAddTask,
  onDeleteTask
}) => {
  // Use the primary user's location to define the timeline range (00:00 to 24:00)
  const primaryLocation = currentUser === 'me' ? myLocation : partnerLocation;
  const slots = generate30MinSlots(selectedDate, primaryLocation);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const slotWidth = 100;

  const scrollToNow = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const isToday = isSameDay(selectedDate, new Date());
      let hourToFocus = 8; 
      let minuteOffset = 0;

      if (isToday) {
        // Calculate the scroll position based on current time in primary location
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: primaryLocation,
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(new Date());
        hourToFocus = parseInt(parts.find(p => p.type === 'hour')?.value || '8');
        minuteOffset = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      }

      const totalMinutes = hourToFocus * 60 + minuteOffset;
      const scrollPos = (totalMinutes / 30) * slotWidth;
      scrollRef.current.scrollTo({ left: scrollPos, behavior });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => scrollToNow('smooth'), 100);
    return () => clearTimeout(timeout);
  }, [selectedDate, currentUser]); // Scroll when tab changes too

  const getEventInSlot = (events: CalendarEvent[], slotStart: Date) => {
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
    return events.find(e => {
      const eStart = new Date(e.startTime);
      const eEnd = new Date(eStart.getTime() + e.durationMinutes * 60000);
      return Math.max(eStart.getTime(), slotStart.getTime()) < Math.min(eEnd.getTime(), slotEnd.getTime());
    });
  };

  const getSlotColor = (type: string, isPartner: boolean) => {
    if (isPartner) {
      switch(type) {
        case 'work': return 'bg-rose-600';
        case 'sleep': return 'bg-slate-700';
        case 'date': return 'bg-pink-600';
        case 'study': return 'bg-emerald-600';
        default: return 'bg-rose-400';
      }
    }
    switch(type) {
      case 'work': return 'bg-pink-600';
      case 'sleep': return 'bg-indigo-900';
      case 'date': return 'bg-rose-500';
      case 'study': return 'bg-emerald-500';
      default: return 'bg-pink-400';
    }
  };

  // Black labels for high visibility
  const topLabel = currentUser === 'me' ? 'Seoul' : 'Georgia';
  const bottomLabel = currentUser === 'me' ? 'Georgia' : 'Seoul';
  const topIcon = currentUser === 'me' ? 'fa-user' : 'fa-heart';
  const bottomIcon = currentUser === 'me' ? 'fa-heart' : 'fa-user';
  const labelColor = 'text-black'; 

  const isViewingToday = isSameDay(selectedDate, new Date());
  
  const getNowLineLeft = () => {
    // Current minutes relative to the start of the timeline (00:00 in primary zone)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: primaryLocation,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(currentTime);
    const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const totalMinutes = h * 60 + m;
    return (totalMinutes / 30) * slotWidth;
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteTask(id);
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden transition-all duration-500">
      <div className="flex bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-pink-50">
            <i className="fa-solid fa-clock text-pink-500 text-xs"></i>
          </div>
          <h3 className="text-xs font-black text-black uppercase tracking-tight">{formatFullDate(selectedDate)}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isViewingToday && (
            <button 
              onClick={() => scrollToNow('smooth')}
              className="px-3 py-1.5 bg-gray-100 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-location-crosshairs"></i>
              Sync Now
            </button>
          )}
          <button 
            onClick={onAddTask}
            className="px-4 py-1.5 bg-pink-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-pink-100 hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            Add Task
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="overflow-x-auto custom-scrollbar relative select-none cursor-grab active:cursor-grabbing scroll-smooth"
      >
        <div className="flex min-w-max p-6 pt-10 relative">
          
          {isViewingToday && (
            <div 
              className="absolute top-0 bottom-0 z-40 w-[2px] bg-red-500 pointer-events-none transition-all duration-1000"
              style={{ left: `calc(${getNowLineLeft()}px + 6rem + 1rem)` }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase shadow-md">
                Now
              </div>
              <div className="absolute -left-[3px] top-[10rem] w-2 h-2 rounded-full bg-red-500 shadow-md"></div>
            </div>
          )}

          <div className="sticky left-0 z-30 bg-white/95 backdrop-blur-sm pr-4 border-r border-gray-100 flex flex-col justify-center gap-12 py-4 mr-2">
             <div className="flex flex-col items-center">
                <span className={`text-[8px] font-black ${labelColor} uppercase mb-1`}>{topLabel}</span>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-gray-50 ${labelColor} shadow-sm border border-gray-100`}>
                  <i className={`fa-solid ${topIcon} text-[10px]`}></i>
                </div>
             </div>
             <div className="flex flex-col items-center">
                <span className={`text-[8px] font-black ${labelColor} uppercase mb-1`}>{bottomLabel}</span>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-gray-50 ${labelColor} shadow-sm border border-gray-100`}>
                  <i className={`fa-solid ${bottomIcon} text-[10px]`}></i>
                </div>
             </div>
          </div>

          {slots.map((slot, idx) => {
            const myEvent = getEventInSlot(myEvents, slot);
            const partnerEvent = getEventInSlot(partnerEvents, slot);
            
            const topEvent = currentUser === 'me' ? myEvent : partnerEvent;
            const bottomEvent = currentUser === 'me' ? partnerEvent : myEvent;
            const isTopPartner = currentUser !== 'me';
            const isBottomPartner = currentUser === 'me';
            
            // Primary time label (top)
            let topTimeLabel = formatTimeOnly(slot, currentUser === 'me' ? myLocation : partnerLocation);
            // Secondary time label (bottom)
            let bottomTimeLabel = formatTimeOnly(slot, currentUser === 'me' ? partnerLocation : myLocation);

            // Special case for 24:00 at the end of the timeline
            if (idx === slots.length - 1) {
              topTimeLabel = "24:00";
              // We could calculate the bottom 24:00 label similarly if needed, 
              // but usually the primary user's focus is the priority.
            }
            
            const now = currentTime;
            // Check current slot using UTC comparison
            const isCurrentSlot = isViewingToday && 
              slot.getUTCHours() === now.getUTCHours() && 
              Math.floor(slot.getUTCMinutes() / 30) === Math.floor(now.getUTCMinutes() / 30);

            return (
              <div key={idx} className={`flex flex-col items-center relative transition-colors duration-300 ${isCurrentSlot ? 'bg-pink-50/10' : ''}`} style={{ width: slotWidth }}>
                <div className={`text-[10px] font-black mb-3 transition-colors ${isCurrentSlot ? 'text-pink-600 scale-110' : 'text-black'}`}>
                  {topTimeLabel}
                </div>
                
                <div className="w-full h-16 px-1 mb-4 group z-10 relative">
                  {topEvent ? (
                    <div 
                      onClick={(e) => handleDelete(e, topEvent.id)}
                      title="Click to delete"
                      className={`w-full h-full rounded-xl flex items-center justify-center transition-all duration-300 relative ${getSlotColor(topEvent.type, isTopPartner)} text-white shadow-sm scale-105 z-10 cursor-pointer group/card active:scale-95`}
                    >
                      <div className="flex flex-col items-center p-1 text-center pointer-events-none">
                        <span className="text-[7px] font-black uppercase tracking-tight leading-tight line-clamp-2">{topEvent.title}</span>
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/20 rounded-md p-0.5">
                         <i className="fa-solid fa-trash-can text-[8px]"></i>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gray-50/50 border border-dashed border-gray-200 group-hover:border-pink-200"></div>
                  )}
                </div>

                <div className="w-full border-t border-gray-200 mb-4 relative h-[1px]">
                   {slot.getUTCMinutes() === 0 && (
                     <div className="absolute top-0 left-0 w-[1px] h-1.5 bg-gray-300 -translate-y-0.75"></div>
                   )}
                </div>

                <div className="w-full h-16 px-1 mb-4 group z-10 relative">
                  {bottomEvent ? (
                    <div 
                      onClick={(e) => handleDelete(e, bottomEvent.id)}
                      title="Click to delete"
                      className={`w-full h-full rounded-xl flex items-center justify-center transition-all duration-300 relative ${getSlotColor(bottomEvent.type, isBottomPartner)} text-white shadow-sm scale-105 z-10 cursor-pointer group/card active:scale-95`}
                    >
                      <div className="flex flex-col items-center p-1 text-center pointer-events-none">
                        <span className="text-[7px] font-black uppercase tracking-tight leading-tight line-clamp-2">{bottomEvent.title}</span>
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/20 rounded-md p-0.5">
                         <i className="fa-solid fa-trash-can text-[8px]"></i>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gray-50/50 border border-dashed border-gray-200 group-hover:border-rose-200"></div>
                  )}
                </div>

                <div className={`text-[10px] font-black transition-colors ${isCurrentSlot ? 'text-rose-600 scale-110' : 'text-black'}`}>
                  {bottomTimeLabel}
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gray-100 -z-10"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SynchronizedTimeline;
