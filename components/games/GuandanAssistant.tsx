import React, { useState } from 'react';
import { analyzeGuandan } from '../../services/localGameLogic'; // Local
import { ArrowLeft, Layers, ChevronLeft, ChevronRight, X, Heart, Spade, Club, Diamond, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onBack: () => void;
  onLog: (msg: string) => void;
}

const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A']; 
const SUITS = ['H', 'S', 'D', 'C'];

const GuandanAssistant: React.FC<Props> = ({ onBack, onLog }) => {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [hand, setHand] = useState<string[]>([]);
  const [played, setPlayed] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [mode, setMode] = useState<'hand'|'played'>('hand');

  const getCardCount = (cardCode: string) => {
      const allSelected = [...hand, ...played];
      return allSelected.filter(c => c === cardCode).length;
  };

  const addCard = (rank: string, suit?: string) => {
      let card = rank;
      if (suit) card += suit; 
      if (!suit) card = rank; 
      if (getCardCount(card) >= 2) return;

      if (mode === 'hand') setHand([...hand, card]);
      else setPlayed([...played, card]);
  };

  const removeCard = (index: number, targetMode: 'hand'|'played') => {
      if (targetMode === 'hand') setHand(hand.filter((_, i) => i !== index));
      else setPlayed(played.filter((_, i) => i !== index));
  };

  const analyze = () => {
    const res = analyzeGuandan(hand);
    setHand(res.sortedHand); // Apply structured sort
    setAnalysis(res.bombs);
    onLog(`Round ${round} - ${t.guandan.bombsFound}`);
  };

  const nextRound = () => {
      setRound(r => r + 1);
      setPlayed([]);
      setAnalysis(null);
      onLog(`Started Round ${round + 1}`);
  };

  const getCardDisplay = (cardCode: string) => {
      if (cardCode === 'SJ') return <span className="text-black font-bold">SJ</span>;
      if (cardCode === 'BJ') return <span className="text-red-600 font-bold">BJ</span>;

      const rankChar = cardCode.slice(0, -1);
      const suitChar = cardCode.slice(-1);
      const rankDisplay = rankChar === 'T' ? '10' : rankChar;
      
      let SuitIcon = Spade;
      let colorClass = "text-black";

      switch (suitChar) {
          case 'H': SuitIcon = Heart; colorClass = "text-red-600"; break;
          case 'D': SuitIcon = Diamond; colorClass = "text-red-600"; break;
          case 'C': SuitIcon = Club; colorClass = "text-black"; break;
          case 'S': SuitIcon = Spade; colorClass = "text-black"; break;
      }

      return (
          <span className={`flex items-center gap-0.5 ${colorClass} font-bold`}>
              {rankDisplay}
              <SuitIcon size={12} fill="currentColor" />
          </span>
      );
  };

  const renderCardList = (cards: string[], targetMode: 'hand'|'played') => {
      // Helper to check if a card is part of a bomb for highlighting
      const isBombCard = (card: string) => {
          if (!analysis || targetMode !== 'hand') return false;
          // Only highlight in hand. 
          // Analysis is array of arrays of strings.
          return analysis.some((bomb: string[]) => bomb.includes(card));
      };

      return (
      <div className="flex flex-wrap gap-1 min-h-[30px] items-center">
          {cards.map((c, i) => (
              <span 
                key={i} 
                className={`
                    px-1.5 py-1 border rounded text-xs font-bold flex items-center gap-1 shadow-sm select-none transition-all
                    ${isBombCard(c) ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-400 scale-105 z-10' : 'bg-white border-slate-300'}
                `}
              >
                  {getCardDisplay(c)}
                  <button onClick={(e) => { e.stopPropagation(); removeCard(i, targetMode); }} className="text-slate-400 hover:text-red-500 ml-1">
                      <X size={12}/>
                  </button>
              </span>
          ))}
          {cards.length === 0 && <span className="text-slate-500 italic text-xs">{t.guandan.placeholderHand}</span>}
      </div>
      )
  };

  return (
    <div className="flex flex-col h-screen bg-blue-950 text-blue-100 overflow-hidden">
      <div className="p-2 bg-blue-900 shadow flex justify-between items-center shrink-0">
        <button onClick={onBack} className="flex gap-2 text-sm text-blue-200 hover:text-white"><ArrowLeft size={18}/> {t.back}</button>
        <div className="flex items-center gap-4">
             <button onClick={() => setRound(Math.max(1, round - 1))} className="p-1 bg-blue-800 rounded text-blue-200 hover:text-white"><ChevronLeft size={16}/></button>
             <span className="font-bold text-sm text-white">{t.round} {round}</span>
             <button onClick={nextRound} className="p-1 bg-blue-800 rounded text-blue-200 hover:text-white"><ChevronRight size={16}/></button>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-blue-900/20">
        <div 
            onClick={() => setMode('hand')}
            className={`p-2 rounded border-2 transition-all cursor-pointer ${mode === 'hand' ? 'border-yellow-400 bg-black/30' : 'border-blue-800 bg-blue-900/40'}`}
        >
            <div className="flex justify-between mb-1">
                <label className="font-bold text-blue-300 text-xs">{t.guandan.handLabel} <span className="text-[10px] font-normal text-blue-400/70">(2 Decks)</span></label>
                <button onClick={(e) => {e.stopPropagation(); setHand([])}} className="text-[10px] text-red-300 hover:text-red-200 underline">{t.clear}</button>
            </div>
            {renderCardList(hand, 'hand')}
        </div>

        <div 
            onClick={() => setMode('played')}
            className={`p-2 rounded border-2 transition-all cursor-pointer ${mode === 'played' ? 'border-yellow-400 bg-black/30' : 'border-slate-600 bg-slate-800/40'}`}
        >
             <div className="flex justify-between mb-1">
                <label className="font-bold text-slate-400 text-xs">{t.guandan.playedLabel}</label>
                <button onClick={(e) => {e.stopPropagation(); setPlayed([])}} className="text-[10px] text-red-300 hover:text-red-200 underline">{t.clear}</button>
            </div>
            {renderCardList(played, 'played')}
        </div>

        <button 
            onClick={analyze}
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 text-sm transition-colors"
        >
            <Layers size={18} /> {t.guandan.check}
        </button>

        {analysis && (
            <div className="bg-slate-800 p-3 rounded-lg border border-blue-500 text-xs shadow-inner">
                <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2"><Zap size={14}/> {t.guandan.bombsFound}</h3>
                {analysis.length === 0 ? <span className="text-slate-400">No bombs found.</span> : (
                    <div className="flex flex-col gap-2">
                        {analysis.map((bomb: string[], i: number) => (
                            <div key={i} className="bg-black/30 p-2 rounded flex gap-2 overflow-x-auto">
                                {bomb.map((c, j) => (
                                    <span key={j} className="bg-yellow-100 px-1 rounded text-black font-bold border border-yellow-400">
                                        {getCardDisplay(c)}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="bg-slate-900 border-t border-slate-700 p-2 shrink-0 flex flex-col gap-1.5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
          <div className="text-[10px] text-center text-slate-400 uppercase tracking-wider">
              Adding to: <span className="text-white font-bold">{mode === 'hand' ? t.guandan.handLabel : t.guandan.playedLabel}</span>
          </div>
          
          <div className="flex flex-col gap-1">
               {SUITS.map(s => {
                   let Icon = Spade;
                   let iconClass = "";
                   if (s === 'H') { Icon = Heart; iconClass = "text-red-600"; }
                   else if (s === 'D') { Icon = Diamond; iconClass = "text-red-600"; }
                   else if (s === 'C') { Icon = Club; iconClass = "text-black"; }
                   else { Icon = Spade; iconClass = "text-black"; }

                   return (
                   <div key={s} className="flex gap-1 justify-between">
                       {RANKS.map(r => {
                           const cardCode = r + s;
                           const count = getCardCount(cardCode);
                           const remaining = 2 - count;
                           const disabled = remaining <= 0;
                           
                           return (
                           <button 
                             key={cardCode} 
                             onClick={() => addCard(r, s)}
                             disabled={disabled}
                             className={`
                                flex-1 h-9 min-w-[20px] rounded flex flex-col items-center justify-center transition-colors shadow-sm relative
                                ${disabled ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-slate-100 hover:bg-white active:bg-blue-100 text-black'}
                             `}
                           >
                               <span className={`text-[10px] font-bold leading-none ${iconClass}`}>{r === 'T' ? '10' : r}</span>
                               <Icon size={10} className={iconClass} fill="currentColor"/>
                               {remaining < 2 && <span className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">{remaining}</span>}
                           </button>
                       )})}
                   </div>
                   );
               })}
               <div className="flex gap-2 mt-1">
                    {['SJ', 'BJ'].map(joker => {
                        const count = getCardCount(joker);
                        const remaining = 2 - count;
                        const disabled = remaining <= 0;
                        return (
                            <button 
                                key={joker}
                                onClick={() => addCard(joker)} 
                                disabled={disabled}
                                className={`flex-1 h-9 rounded font-bold text-xs shadow-sm border-b-2 relative 
                                    ${joker === 'SJ' ? 'bg-slate-300 text-black border-slate-400' : 'bg-red-200 text-red-900 border-red-300'}
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}
                                `}
                            >
                                {joker} <span className="text-[9px] font-normal ml-1 opacity-70">({joker === 'SJ' ? 'Black' : 'Red'})</span>
                                {remaining < 2 && <span className="absolute top-0 right-1 bg-blue-600 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">{remaining}</span>}
                            </button>
                        )
                    })}
               </div>
          </div>
      </div>
    </div>
  );
};

export default GuandanAssistant;
