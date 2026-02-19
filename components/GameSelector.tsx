import React from 'react';
import { GameType } from '../types';
import { CircleDot, Club, CreditCard, Box, Grid3X3, Clock, Globe, Share2, User } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface Props {
  onSelect: (game: GameType) => void;
  onViewHistory: () => void;
}

const GameSelector: React.FC<Props> = ({ onSelect, onViewHistory }) => {
  const { t, language, setLanguage } = useLanguage();

  const games = [
    { type: GameType.GO, name: t.games.GO, icon: <CircleDot className="text-white" size={32} />, color: 'bg-stone-700' },
    { type: GameType.POKER, name: t.games.POKER, icon: <Club className="text-red-400" size={32} />, color: 'bg-green-800' },
    { type: GameType.GUANDAN, name: t.games.GUANDAN, icon: <CreditCard className="text-yellow-400" size={32} />, color: 'bg-blue-800' },
    { type: GameType.MAHJONG, name: t.games.MAHJONG, icon: <Box className="text-emerald-400" size={32} />, color: 'bg-teal-800' },
    { type: GameType.XIANGQI, name: t.games.XIANGQI, icon: <Grid3X3 className="text-orange-400" size={32} />, color: 'bg-amber-900' },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert(t.shareSuccess);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="h-screen w-full bg-slate-950 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center p-4 relative">
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2 items-center z-10">
          <button 
             onClick={handleShare}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors"
          >
              <Share2 size={16} />
              <span className="hidden md:inline">{t.share}</span>
          </button>
          
          <div className="flex gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 items-center">
            <Globe size={20} className="text-slate-400" />
            <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
            >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2 mt-12 md:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center">
          {t.appTitle}
        </h1>
        <p className="text-slate-400 mb-8 text-sm md:text-base text-center">{t.selectGame}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl px-2 pb-8">
          {games.map((g) => (
            <button
              key={g.type}
              onClick={() => onSelect(g.type)}
              className={`${g.color} p-4 md:p-6 rounded-xl shadow-lg hover:scale-105 transition-transform flex flex-col items-center gap-3 border border-white/10`}
            >
              <div className="p-3 md:p-4 bg-black/20 rounded-full scale-90 md:scale-100">{g.icon}</div>
              <span className="text-sm md:text-xl font-semibold text-center">{g.name}</span>
            </button>
          ))}
          
          <button
            onClick={onViewHistory}
            className="bg-slate-800 p-4 md:p-6 rounded-xl shadow-lg hover:scale-105 transition-transform flex flex-col items-center gap-3 border border-white/10 group"
          >
            <div className="p-3 md:p-4 bg-black/20 rounded-full group-hover:bg-blue-500/20 transition-colors scale-90 md:scale-100">
              <Clock className="text-blue-400" size={32} />
            </div>
            <span className="text-sm md:text-xl font-semibold text-slate-300 text-center">{t.history}</span>
          </button>
        </div>

        {/* Author Footer */}
        <div className="mt-8 mb-4 text-slate-500 text-xs md:text-sm flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <User size={14} />
            <span>{t.author}:</span>
            <a 
                href="http://haoj.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 hover:underline font-mono"
            >
                http://haoj.in
            </a>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;