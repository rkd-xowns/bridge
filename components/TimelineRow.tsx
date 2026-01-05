
import React from 'react';
import { CalendarEvent, Location } from '../types';

interface TimelineRowProps {
  label: string;
  location: Location;
  events: CalendarEvent[];
  timezone: string;
  color: string;
  isMe?: boolean;
}

const TimelineRow: React.FC<TimelineRowProps> = ({ label, location, events, timezone, color, isMe }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = new Date(new Date().toLocaleString('en-US', { timeZone: location })).getHours();

  // Helper to determine if an hour has an event
  const getEventAtHour = (hour: number) => {
    return events.find(event => {
      const eventDate = new Date(event.startTime);
      const eventHour = new Date(eventDate.toLocaleString('en-US', { timeZone: location })).getHours();
      return eventHour === hour;
    });
  };

  return (
    <div className={`flex flex-col space-y-3 mb-6 p-4 rounded-3xl transition-all ${isMe ? 'bg-pink-50/50 border border-pink-100' : 'bg-rose-50/30 border border-rose-100'}`}>
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shadow-sm`}>
            <i className={`fa-solid ${isMe ? 'fa-user' : 'fa-heart'}`}></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">
              {label}
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{timezone}</span>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Current Time</span>
          <span className="text-sm font-mono font-bold text-gray-700">
            {new Intl.DateTimeFormat('en-US', {
              timeZone: location,
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(new Date())}
          </span>
        </div>
      </div>
      
      <div className="relative flex overflow-x-auto pb-4 custom-scrollbar bg-white rounded-2xl shadow-inner border border-gray-100 p-4">
        <div className="flex min-w-max space-x-1">
          {hours.map((hour) => {
            const event = getEventAtHour(hour);
            const isNight = hour < 7 || hour > 21;
            const isNow = hour === currentHour;
            
            return (
              <div key={hour} className="flex flex-col items-center w-20 relative">
                <span className={`text-[10px] mb-1 font-medium ${isNow ? 'text-pink-600 font-bold' : 'text-gray-400'}`}>
                  {hour}:00
                </span>
                <div 
                  className={`w-full h-20 rounded-xl border flex items-center justify-center relative transition-all duration-300
                    ${event ? `${color} text-white border-transparent shadow-md scale-105 z-10` : 
                      isNight ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}
                    ${isNow && !event ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
                  `}
                >
                  {event ? (
                    <div className="flex flex-col items-center text-center p-1">
                      <span className="text-[10px] font-bold leading-tight uppercase truncate w-16">
                        {event.title}
                      </span>
                      <i className={`text-[10px] mt-1 fa-solid ${
                        event.type === 'work' ? 'fa-briefcase' : 
                        event.type === 'sleep' ? 'fa-moon' : 
                        event.type === 'date' ? 'fa-heart' : 'fa-star'
                      }`}></i>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      {isNight ? (
                        <i className="fa-solid fa-moon text-gray-400 text-xs"></i>
                      ) : (
                        <i className="fa-solid fa-sun text-gray-400 text-xs"></i>
                      )}
                    </div>
                  )}
                  
                  {isNow && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full shadow-sm"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineRow;
