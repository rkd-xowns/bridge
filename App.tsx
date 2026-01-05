
import React, { useState, useEffect, useRef } from 'react';
import { Location, CalendarEvent, DailyHighlight, DailyFeeling } from './types';
import { getTimeInZone } from './utils/timeUtils';
import { updateBridge, getBridgeData, mergeData, SharedData } from './services/syncService';
import SynchronizedTimeline from './components/SynchronizedTimeline';
import EventModal from './components/EventModal';
import CalendarPicker from './components/CalendarPicker';
import FeelingSection from './components/FeelingSection';

const PRESET_COLORS = [
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Violet', hex: '#8b5cf6' },
];

const PRIVATE_BRIDGE_ID = 'ldr-taejun-yuju-bridge-v1';

const App: React.FC = () => {
  const STORAGE_KEYS = {
    EVENTS: 'bridge_ldr_events',
    HIGHLIGHTS: 'bridge_ldr_highlights',
    FEELINGS: 'bridge_ldr_feelings',
    NAMES: 'bridge_ldr_names'
  };

  const [currentUser, setCurrentUser] = useState<'me' | 'partner'>('me');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [names, setNames] = useState<{ me: string; partner: string }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NAMES);
    return saved ? JSON.parse(saved) : { me: '태준', partner: '유주' };
  });

  const [highlights, setHighlights] = useState<Record<string, DailyHighlight>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
    return saved ? JSON.parse(saved) : {};
  });
  
  const [feelings, setFeelings] = useState<DailyFeeling[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEELINGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [isEditingHighlight, setIsEditingHighlight] = useState(false);
  const [tempHighlightTitle, setTempHighlightTitle] = useState('');
  const [tempHighlightColor, setTempHighlightColor] = useState(PRESET_COLORS[0].hex);
  const [times, setTimes] = useState({ korea: getTimeInZone(Location.KOREA), georgia: getTimeInZone(Location.GEORGIA) });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Background Push
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(allEvents));
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
    localStorage.setItem(STORAGE_KEYS.FEELINGS, JSON.stringify(feelings));
    localStorage.setItem(STORAGE_KEYS.NAMES, JSON.stringify(names));
    
    setSyncStatus('pending');
    const data: SharedData = { events: allEvents, highlights, feelings, names, lastUpdated: new Date().toISOString() };
    updateBridge(PRIVATE_BRIDGE_ID, data).then(success => {
      setSyncStatus(success ? 'synced' : 'error');
    });
  }, [allEvents, highlights, feelings, names]);

  // Background Pull (Polling)
  useEffect(() => {
    const interval = setInterval(async () => {
      const remote = await getBridgeData(PRIVATE_BRIDGE_ID);
      if (remote) {
        setAllEvents(prev => mergeData(prev, remote.events));
        setFeelings(prev => mergeData(prev, remote.feelings));
        setHighlights(prev => ({ ...prev, ...remote.highlights }));
        if (remote.names) setNames(remote.names);
        setSyncStatus('synced');
      } else {
        // Only set error if we actually fail a network request
        // (getBridgeData logs the error to console internally)
      }
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimes({ korea: getTimeInZone(Location.KOREA), georgia: getTimeInZone(Location.GEORGIA) });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddEvent = (eventData: any) => setAllEvents([...allEvents, { ...eventData, userId: currentUser }]);
  const handleDeleteEvent = (eventId: string) => setAllEvents(prev => prev.filter(e => e.id !== eventId));
  const handleAddFeeling = (text: string, emoji: string) => {
    const newFeeling: DailyFeeling = { id: Math.random().toString(36).substr(2, 9), userId: currentUser, text, emoji, timestamp: new Date().toISOString(), dateKey: getDateKey(selectedDate) };
    setFeelings([...feelings, newFeeling]);
  };

  const getDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  const changeDate = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const saveHighlight = () => {
    setHighlights({ ...highlights, [getDateKey(selectedDate)]: { dateKey: getDateKey(selectedDate), title: tempHighlightTitle || 'Main Event', color: tempHighlightColor } });
    setIsEditingHighlight(false);
  };

  const currentHighlight = highlights[getDateKey(selectedDate)];

  return (
    <div className="min-h-screen pb-12 bg-[#fffafa]">
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-pink-50 p-1 rounded-xl border border-pink-100 shadow-sm flex scale-95 sm:scale-100 origin-left">
              <button onClick={() => setCurrentUser('me')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currentUser === 'me' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-300'}`}>{names.me}</button>
              <button onClick={() => setCurrentUser('partner')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currentUser === 'partner' ? 'bg-rose-400 text-white shadow-md' : 'text-pink-300'}`}>{names.partner}</button>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all border border-gray-100 relative"
            >
              <i className="fa-solid fa-user-gear text-sm"></i>
              <div 
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white transition-colors duration-500 ${
                  syncStatus === 'synced' ? 'bg-emerald-500' : 
                  syncStatus === 'pending' ? 'bg-amber-400' : 'bg-rose-500'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 bg-pink-50/50 px-4 py-1.5 rounded-2xl border border-pink-100">
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-black text-pink-400 uppercase tracking-tighter">Seoul</span>
              <span className="text-xs font-mono font-black text-black">{times.korea}</span>
            </div>
            <div className="h-6 w-[1.5px] bg-pink-200/50"></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">Georgia</span>
              <span className="text-xs font-mono font-black text-black">{times.georgia}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8 flex flex-col items-center gap-4">
           <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-pink-50">
            <button onClick={() => changeDate(-1)} className="w-8 h-8 rounded-full hover:bg-pink-50 text-pink-400 transition-colors"><i className="fa-solid fa-chevron-left text-xs"></i></button>
            <button onClick={() => setIsCalendarOpen(true)} className="flex flex-col items-center px-4 py-1 rounded-xl hover:bg-pink-50 group">
               <span className="text-[9px] font-black text-black uppercase tracking-widest leading-none mb-1">Our Date</span>
               <div className="flex items-center gap-1.5"><h2 className="text-sm font-black text-black">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</h2><i className="fa-solid fa-calendar-days text-pink-400 text-xs"></i></div>
            </button>
            <button onClick={() => changeDate(1)} className="w-8 h-8 rounded-full hover:bg-pink-50 text-pink-400 transition-colors"><i className="fa-solid fa-chevron-right text-xs"></i></button>
          </div>

          {currentHighlight ? (
            <button onClick={() => { setTempHighlightTitle(currentHighlight.title); setTempHighlightColor(currentHighlight.color); setIsEditingHighlight(true); }} className="group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border-2 transition-all shadow-sm" style={{ borderColor: currentHighlight.color, backgroundColor: `${currentHighlight.color}10` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentHighlight.color }}></div>
              <div className="flex flex-col items-start"><span className="text-[8px] font-black uppercase tracking-widest leading-none" style={{ color: currentHighlight.color }}>Daily Focus</span><span className="text-xs font-black text-black">{currentHighlight.title}</span></div>
            </button>
          ) : (
            <button onClick={() => { setTempHighlightTitle(''); setTempHighlightColor(PRESET_COLORS[0].hex); setIsEditingHighlight(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-dashed border-gray-300 text-gray-500 text-[10px] font-black hover:border-pink-400 hover:text-pink-500 transition-all bg-white/50">
              <i className="fa-solid fa-plus-circle"></i> Describe This Day
            </button>
          )}
        </div>

        <SynchronizedTimeline myEvents={allEvents.filter(e => e.userId === 'me')} partnerEvents={allEvents.filter(e => e.userId === 'partner')} myLocation={Location.KOREA} partnerLocation={Location.GEORGIA} currentUser={currentUser} selectedDate={selectedDate} onAddTask={() => setIsModalOpen(true)} onDeleteTask={handleDeleteEvent} />
        <FeelingSection feelings={feelings.filter(f => f.dateKey === getDateKey(selectedDate))} onAddFeeling={handleAddFeeling} currentUser={currentUser} myLocation={Location.KOREA} partnerLocation={Location.GEORGIA} names={names} />
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-black">Profile</h2>
              <button onClick={() => setIsSettingsOpen(false)}><i className="fa-solid fa-times text-gray-400"></i></button>
            </div>
            
            <div className="space-y-4">
               <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-tight ml-1">My Name</label>
                <input id="meName" type="text" defaultValue={names.me} className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm font-bold outline-none border border-gray-100 focus:border-pink-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-tight ml-1">Partner Name</label>
                <input id="partnerName" type="text" defaultValue={names.partner} className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm font-bold outline-none border border-gray-100 focus:border-pink-200" />
              </div>
              
              <button 
                onClick={() => {
                  const me = (document.getElementById('meName') as HTMLInputElement).value;
                  const partner = (document.getElementById('partnerName') as HTMLInputElement).value;
                  setNames({ me, partner });
                  setIsSettingsOpen(false);
                }} 
                className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl"
              >
                Save Changes
              </button>
            </div>
            
            <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-tighter">Your bridge is private and always synced.</p>
          </div>
        </div>
      )}

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddEvent} userLocation={currentUser === 'me' ? Location.KOREA : Location.GEORGIA} selectedDate={selectedDate} />
      {isCalendarOpen && <CalendarPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} onClose={() => setIsCalendarOpen(false)} highlights={highlights} />}
      
      {isEditingHighlight && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] w-full max-sm:max-w-xs shadow-2xl p-6 space-y-5">
            <h3 className="text-lg font-black text-black">Today's Focus</h3>
            <input type="text" value={tempHighlightTitle} onChange={(e) => setTempHighlightTitle(e.target.value)} placeholder="e.g. Flight, Date Night..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-black text-sm text-black outline-none" autoFocus />
            <div className="grid grid-cols-7 gap-2">
              {PRESET_COLORS.map(color => (
                <button key={color.hex} onClick={() => setTempHighlightColor(color.hex)} className={`w-full aspect-square rounded-lg transition-all ${tempHighlightColor === color.hex ? 'scale-110 shadow-md ring-2 ring-gray-100' : 'opacity-60'}`} style={{ backgroundColor: color.hex }}>{tempHighlightColor === color.hex && <i className="fa-solid fa-check text-white text-[10px]"></i>}</button>
              ))}
            </div>
            <div className="flex gap-2 pt-3">
              <button onClick={() => setIsEditingHighlight(false)} className="flex-1 py-3 text-black font-black text-[10px] uppercase tracking-widest">Cancel</button>
              <button onClick={saveHighlight} className="flex-1 py-3 bg-pink-500 text-white font-black text-[10px] uppercase shadow-lg shadow-pink-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
