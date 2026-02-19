import React, { useState, useEffect } from 'react';
import { analyzeMahjong } from '../../services/localGameLogic'; // Local
import { MahjongRule } from '../../types';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onBack: () => void;
  onLog: (msg: string) => void;
}

const SUITS_DATA = [
    { type: 'm', label: '万', en: 'M', color: 'text-red-600' },
    { type: 'p', label: '筒', en: 'P', color: 'text-emerald-800' },
    { type: 's', label: '条', en: 'S', color: 'text-lime-600' }
];

const HONORS_DATA = [
    { id: 'E', ch: '东', en: 'East' },
    { id: 'S', ch: '南', en: 'Sth' },
    { id: 'W', ch: '西', en: 'West' },
    { id: 'N', ch: '北', en: 'Nth' },
    { id: 'P', ch: '白', en: 'Wht' },
    { id: 'F', ch: '发', en: 'Grn', color: 'text-green-600' }, 
    { id: 'C', ch: '中', en: 'Red', color: 'text-red-600' }, 
];

const MahjongAssistant: React.FC<Props> = ({ onBack, onLog }) => {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [rule, setRule] = useState<MahjongRule>('National');
  const [hand, setHand] = useState<string[]>([]);
  const [discards, setDiscards] = useState<string[]>([]);
  const [waitingResults, setWaitingResults] = useState<{tile: string, fan: number, label: string}[]>([]);
  const [mode, setMode] = useState<'hand'|'discards'>('hand');

  // Auto analyze when hand changes or rule changes
  useEffect(() => {
      const res = analyzeMahjong(hand, rule);
      setWaitingResults(res.waitingResults);
  }, [hand, rule]);

  const getTileCount = (tile: string) => {
      const all = [...hand, ...discards];
      return all.filter(t => t === tile).length;
  };

  const addTile = (tile: string) => {
      if (getTileCount(tile) >= 4) return;
      if (mode === 'hand') {
          if (hand.length >= 13) return;
          setHand([...hand, tile]);
      } else {
          setDiscards([...discards, tile]);
      }
  };

  const removeTile = (index: number) => {
      if (mode === 'hand') setHand(hand.filter((_, i) => i !== index));
      else setDiscards(discards.filter((_, i) => i !== index));
  };

  const nextRound = () => {
      setRound(r => r + 1);
      onLog(`Started Round ${round + 1}`);
  };

  const renderTile = (tile: string, mini = false) => {
      let displayCh = tile;
      let displayEn = '';
      let textColor = 'text-black';
      
      const lastChar = tile.slice(-1);
      if (['m','p','s'].includes(lastChar)) {
          const num = tile.slice(0, -1);
          const suit = SUITS_DATA.find(s => s.type === lastChar);
          displayCh = `${num}${suit?.label}`;
          displayEn = `${num}${suit?.en}`;
          if (suit?.color) textColor = suit.color;
      } else {
          const honor = HONORS_DATA.find(h => h.id === tile);
          if (honor) {
              displayCh = honor.ch;
              displayEn = honor.en;
              if (honor.color) textColor = honor.color;
          }
      }

      return (
        <div className={`${mini ? 'w-6 h-8 text-xs' : 'w-8 h-10 text-sm'} bg-white border border-slate-300 rounded flex flex-col items-center justify-center shadow ${textColor} leading-none select-none`}>
            <span className="font-bold">{displayCh}</span>
            {!mini && <span className="text-[8px] text-slate-500 scale-75">{displayEn}</span>}
        </div>
      );
  };

  const renderList = (tiles: string[], targetMode: 'hand'|'discards') => (
      <div className="flex flex-wrap gap-1 min-h-[44px] bg-black/20 p-2 rounded">
          {tiles.map((tile, i) => (
              <div key={i} className="relative group cursor-pointer" onClick={() => removeTile(i)}>
                  {renderTile(tile)}
                  <div className="absolute inset-0 bg-red-500/50 hidden group-hover:flex items-center justify-center rounded text-white"><X size={16}/></div>
              </div>
          ))}
          {tiles.length === 0 && <span className="text-slate-400 italic text-xs p-2">{t.mahjong.enterHand}</span>}
      </div>
  );

  return (
    <div className="flex flex-col h-screen bg-teal-950 text-teal-50 overflow-hidden">
      <div className="p-2 bg-teal-900 flex justify-between items-center shadow shrink-0">
        <button onClick={onBack} className="flex gap-2 text-sm"><ArrowLeft size={18}/> {t.back}</button>
        <div className="flex items-center gap-2">
            <button onClick={() => setRound(Math.max(1, round-1))} className="bg-teal-800 p-1 rounded"><ChevronLeft size={16}/></button>
            <span className="text-sm">{round}</span>
            <button onClick={nextRound} className="bg-teal-800 p-1 rounded"><ChevronRight size={16}/></button>
        </div>
        <select 
            value={rule} 
            onChange={(e) => setRule(e.target.value as MahjongRule)}
            className="bg-teal-800 border border-teal-600 rounded px-2 py-1 text-xs"
        >
            <option value="National">National (国标)</option>
            <option value="Tianjin">Tianjin (天津)</option>
            <option value="Sichuan">Sichuan (四川)</option>
            <option value="Riichi">Riichi (日本)</option>
            <option value="Taiwan">Taiwan (台湾)</option>
        </select>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-teal-900/10">
         <div 
            onClick={() => setMode('hand')}
            className={`p-2 rounded border-2 transition-all cursor-pointer ${mode === 'hand' ? 'border-emerald-400 bg-black/10' : 'border-teal-800'}`}
         >
            <div className="flex justify-between mb-1">
                <span className="text-xs font-bold uppercase">{t.mahjong.myTiles} <span className="text-[10px] text-teal-300 normal-case">(Max 13)</span></span>
                <button onClick={(e) => {e.stopPropagation(); setHand([])}} className="text-[10px] text-red-300 underline">{t.clear}</button>
            </div>
            {renderList(hand, 'hand')}
         </div>

         <div 
            onClick={() => setMode('discards')}
            className={`p-2 rounded border-2 transition-all cursor-pointer ${mode === 'discards' ? 'border-emerald-400 bg-black/10' : 'border-teal-800'}`}
         >
            <div className="flex justify-between mb-1">
                <span className="text-xs font-bold uppercase text-slate-400">{t.mahjong.discards}</span>
                <button onClick={(e) => {e.stopPropagation(); setDiscards([])}} className="text-[10px] text-red-300 underline">{t.clear}</button>
            </div>
            {renderList(discards, 'discards')}
         </div>

        {/* WINNING TILES PANEL */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-teal-500 shadow-xl text-xs overflow-y-auto">
             <div className="font-bold text-teal-400 mb-2 uppercase tracking-wide">{t.mahjong.result}</div>
             {waitingResults.length === 0 ? (
                 <p className="text-slate-400 italic">No winning tiles found yet. Hand must be "Ready" (13 tiles).</p>
             ) : (
                 <div className="flex gap-4 flex-wrap">
                     {waitingResults.map((r, i) => (
                         <div key={i} className="flex items-center gap-2 bg-black/40 p-1.5 rounded pr-3">
                             {renderTile(r.tile, true)}
                             <div className="flex flex-col">
                                 <span className="text-white font-bold">{t.mahjong.winTile}</span>
                                 <span className="text-amber-400 font-mono">{r.fan} {t.mahjong.fan}</span>
                                 <span className="text-[9px] text-teal-300">{r.label}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
      </div>

      <div className="bg-slate-900 border-t border-slate-700 p-2 shrink-0 flex flex-col gap-1">
          <div className="text-[10px] text-center text-slate-500">Select to add to: <span className="text-white font-bold">{mode === 'hand' ? t.mahjong.myTiles : t.mahjong.discards}</span></div>
          <div className="flex flex-col gap-1">
              {SUITS_DATA.map(s => (
                  <div key={s.type} className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9].map(n => {
                          const tileCode = n + s.type;
                          const count = getTileCount(tileCode);
                          const remaining = 4 - count;
                          const disabled = remaining <= 0;
                          return (
                          <button 
                            key={tileCode} 
                            onClick={() => addTile(tileCode)}
                            disabled={disabled}
                            className={`flex-1 h-9 bg-white text-black rounded flex flex-col items-center justify-center relative
                                ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-200'}
                            `}
                          >
                              <span className={`text-xs font-bold leading-none ${s.color}`}>{n}{s.label}</span>
                              {remaining < 4 && <span className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">{remaining}</span>}
                          </button>
                      )})}
                  </div>
              ))}
              <div className="flex gap-1">
                  {HONORS_DATA.map(h => {
                      const count = getTileCount(h.id);
                      const remaining = 4 - count;
                      const disabled = remaining <= 0;
                      return (
                      <button 
                        key={h.id} 
                        onClick={() => addTile(h.id)}
                        disabled={disabled}
                        className={`flex-1 h-9 bg-amber-100 text-black rounded flex flex-col items-center justify-center relative
                            ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-amber-200'}
                        `}
                      >
                           <span className={`text-xs font-bold leading-none ${h.color || ''}`}>{h.ch}</span>
                           <span className="text-[8px] leading-none scale-75">{h.en}</span>
                           {remaining < 4 && <span className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">{remaining}</span>}
                      </button>
                  )})}
              </div>
          </div>
      </div>
    </div>
  );
};

export default MahjongAssistant;
