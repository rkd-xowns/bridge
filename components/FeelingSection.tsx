
import React, { useState } from 'react';
import { DailyFeeling, Location } from '../types';

interface FeelingSectionProps {
  feelings: DailyFeeling[];
  onAddFeeling: (text: string, emoji: string) => void;
  currentUser: 'me' | 'partner';
  myLocation: Location;
  partnerLocation: Location;
  names: { me: string; partner: string };
}

const EMOJIS = ['❤️', '😊', '🥰', '🥺', '😴', '😤', '😭', '🤯', '🍕', '☕', '✨'];

const FeelingSection: React.FC<FeelingSectionProps> = ({ 
  feelings, 
  onAddFeeling, 
  currentUser,
  myLocation,
  partnerLocation,
  names
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddFeeling(text, selectedEmoji);
      setText('');
      setIsAdding(false);
    }
  };

  const getDualTime = (isoString: string) => {
    const date = new Date(isoString);
    const krTime = new Intl.DateTimeFormat('en-US', {
      timeZone: myLocation,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    const gaTime = new Intl.DateTimeFormat('en-US', {
      timeZone: partnerLocation,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    
    const primaryTime = currentUser === 'me' ? krTime : gaTime;
    const secondaryTime = currentUser === 'me' ? gaTime : krTime;
    const primaryZone = currentUser === 'me' ? 'Seoul' : 'Georgia';
    const secondaryZone = currentUser === 'me' ? 'Georgia' : 'Seoul';
    
    return { primaryTime, secondaryTime, primaryZone, secondaryZone };
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <i className="fa-solid fa-face-smile-heart text-pink-400"></i>
          Daily Feelings
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-[9px] font-black text-pink-500 uppercase tracking-widest hover:underline flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            Post Note
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-pink-200 animate-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-xl p-2 rounded-xl transition-all ${selectedEmoji === emoji ? 'bg-pink-100 scale-125' : 'grayscale hover:grayscale-0'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How are you feeling right now?..."
              className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-pink-200 outline-none text-sm font-medium text-gray-700 h-24 resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-pink-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-pink-100"
              >
                Post Note
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 px-1">
        {feelings.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">No notes today yet. Start the conversation!</p>
          </div>
        )}
        
        {feelings.map((feeling, idx) => {
          const rotation = (idx % 3 === 0) ? '-1deg' : (idx % 3 === 1) ? '1.5deg' : '-2deg';
          const colorClass = feeling.userId === 'me' ? 'bg-[#fef9c3]' : 'bg-[#fce7f3]';
          const { primaryTime, secondaryTime, primaryZone, secondaryZone } = getDualTime(feeling.timestamp);

          return (
            <div 
              key={feeling.id}
              style={{ transform: `rotate(${rotation})` }}
              className={`${colorClass} p-5 rounded-md shadow-lg shadow-black/5 border border-black/5 hover:scale-105 transition-all duration-300 relative group aspect-square flex flex-col justify-between`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/40 rounded shadow-inner rotate-1"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-2xl drop-shadow-sm">{feeling.emoji}</span>
                  <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${feeling.userId === 'me' ? 'bg-amber-400 text-white' : 'bg-pink-500 text-white'}`}>
                    {feeling.userId === 'me' ? names.me : names.partner}
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-5">
                  {feeling.text}
                </p>
              </div>

              <div className="pt-2 mt-auto border-t border-black/5 flex flex-col items-start gap-1">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-black text-black/60 uppercase">
                    {primaryZone}: <span className="text-black">{primaryTime}</span>
                  </span>
                  <i className="fa-solid fa-quote-right text-black/5 text-lg"></i>
                </div>
                <span className="text-[7px] font-black text-black/20 uppercase tracking-tight">
                  {secondaryZone}: {secondaryTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeelingSection;
