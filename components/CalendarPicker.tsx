
import React, { useState } from 'react';
import { isSameDay, getDaysInMonth, getFirstDayOfMonth } from '../utils/timeUtils';
import { DailyHighlight } from '../types';

interface CalendarPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  highlights: Record<string, DailyHighlight>;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ selectedDate, onSelectDate, onClose, highlights }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(viewDate);

  const handleDayClick = (day: number) => {
    onSelectDate(new Date(currentYear, currentMonth, day));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-pink-500 to-rose-400 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black tracking-tight">Monthly View</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="flex justify-between items-center">
            <button onClick={prevMonth} className="hover:scale-110 transition-transform">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="text-center">
              <div className="text-lg font-bold uppercase tracking-widest">{monthName}</div>
              <div className="text-xs font-medium opacity-80">{currentYear}</div>
            </div>
            <button onClick={nextMonth} className="hover:scale-110 transition-transform">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-gray-400 py-2">
                {day}
              </div>
            ))}
            {padding.map(i => (
              <div key={`pad-${i}`} className="p-2"></div>
            ))}
            {days.map(day => {
              const date = new Date(currentYear, currentMonth, day);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              
              const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const highlight = highlights[dateKey];
              
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    p-2 text-sm font-bold rounded-xl transition-all relative h-12 flex flex-col items-center justify-start
                    ${isSelected ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'text-gray-600 hover:bg-pink-50'}
                    ${isToday && !isSelected ? 'text-pink-500 ring-1 ring-pink-100' : ''}
                  `}
                >
                  <span className="z-10">{day}</span>
                  {highlight && (
                    <div 
                      className="w-full h-1 mt-1 rounded-full animate-in fade-in" 
                      style={{ backgroundColor: highlight.color }}
                      title={highlight.title}
                    ></div>
                  )}
                  {isToday && (
                    <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-500'}`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col items-center gap-2">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Main events shown as color bars</p>
          <button 
            onClick={() => handleDayClick(new Date().getDate())}
            className="text-[10px] font-black text-pink-500 uppercase tracking-widest hover:underline"
          >
            Back to Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPicker;
