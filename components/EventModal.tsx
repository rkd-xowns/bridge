
import React, { useState } from 'react';
import { Location } from '../types';
import { getTimezoneAbbreviation } from '../utils/timeUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: any) => void;
  userLocation: Location;
  selectedDate: Date;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, userLocation, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [startHour, setStartHour] = useState('09');
  const [startMin, setStartMin] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMin, setEndMin] = useState('00');
  const [selectedTz, setSelectedTz] = useState<Location>(userLocation);
  const [type, setType] = useState<'work' | 'sleep' | 'leisure' | 'date' | 'study' | 'other'>('work');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct local date parts
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    
    // Create a date object representing the local time entered
    // We treat it as UTC first, then adjust by the timezone's offset
    const startObj = new Date(Date.UTC(year, month, day, parseInt(startHour, 10), parseInt(startMin, 10)));
    const endObj = new Date(Date.UTC(year, month, day, parseInt(endHour, 10), parseInt(endMin, 10)));

    // Helper to calculate the UTC offset in minutes for the chosen timezone at that specific time
    const getOffset = (date: Date, tz: string) => {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
      return (utcDate.getTime() - tzDate.getTime()) / 60000;
    };

    const offset = getOffset(startObj, selectedTz);
    const startTimeUTC = new Date(startObj.getTime() + offset * 60000);
    const endTimeUTC = new Date(endObj.getTime() + offset * 60000);

    // If end time is before start time, assume it ends the next day
    if (endTimeUTC <= startTimeUTC) {
      endTimeUTC.setUTCDate(endTimeUTC.getUTCDate() + 1);
    }

    const durationMinutes = (endTimeUTC.getTime() - startTimeUTC.getTime()) / 60000;
    
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      title: title || 'New Task',
      startTime: startTimeUTC.toISOString(),
      durationMinutes,
      type
    });
    
    setTitle('');
    onClose();
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '30'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-8">
          <h2 className="text-white text-2xl font-black flex items-center gap-3 italic">
            <i className="fa-solid fa-calendar-plus"></i>
            NEW TASK
          </h2>
          <p className="text-pink-100 text-xs mt-2 font-bold uppercase tracking-widest opacity-80">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Session, Gym, Movie Night"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-gray-700"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone for this entry</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                type="button" 
                onClick={() => setSelectedTz(Location.KOREA)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedTz === Location.KOREA ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}
              >
                Seoul ({getTimezoneAbbreviation(Location.KOREA)})
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedTz(Location.GEORGIA)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedTz === Location.GEORGIA ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}
              >
                Georgia ({getTimezoneAbbreviation(Location.GEORGIA)})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From</label>
              <div className="flex gap-2">
                <select 
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select 
                  value={startMin}
                  onChange={(e) => setStartMin(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To</label>
              <div className="flex gap-2">
                <select 
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select 
                  value={endMin}
                  onChange={(e) => setEndMin(e.target.value)}
                  className="flex-1 px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none font-bold text-gray-700"
                >
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {(['work', 'sleep', 'leisure', 'date', 'study', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setType(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === cat ? 'bg-pink-500 text-white shadow-lg shadow-pink-100 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {cat === 'date' ? 'Date ❤️' : cat === 'study' ? 'Study 📚' : cat === 'leisure' ? 'Free to Call' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
