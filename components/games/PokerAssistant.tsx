import React, { useState, useEffect } from 'react';
import { ArrowLeft, Spade, Heart, Diamond, Club, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onBack: () => void;
  onLog: (msg: string) => void;
}

const SUITS = ['S', 'H', 'D', 'C'];
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Simplified Rank Power for heuristic evaluation
const RANK_POWER: Record<string, number> = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, 
    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

const PokerAssistant: React.FC<Props> = ({ onBack, onLog }) => {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [hole, setHole] = useState<string[]>([]);
  const [community, setCommunity] = useState<string[]>([]);
  const [opponentHole, setOpponentHole] = useState<string[]>([]);
  
  const [stats, setStats] = useState({ win: 0, fold: 0, call: 0, raise: 0 });
  const [selectionMode, setSelectionMode] = useState<'hole'|'community'|'opponent'>('hole');

  // Real-time calculation effect
  useEffect(() => {
    calculateStats();
  }, [hole, community, opponentHole]);

  const calculateStats = () => {
      if (hole.length < 2) {
          setStats({ win: 0, fold: 0, call: 0, raise: 0 });
          return;
      }

      // Simple Heuristic Simulation (Monte Carlo Lite)
      // In a real app, use a library like 'pokersolver'
      let myScore = 0;
      let oppScore = 0;

      // 1. Hole Card Strength (High Card + Pairs)
      const h1 = RANK_POWER[hole[0][0]];
      const h2 = RANK_POWER[hole[1][0]];
      myScore += (h1 + h2);
      if (h1 === h2) myScore += 20; // Pocket Pair
      if (hole[0][1] === hole[1][1]) myScore += 5; // Suited

      // Opponent Strength Analysis
      // If we have known opponent cards, factor them in
      if (opponentHole.length > 0) {
          // Average value of known cards
          const oppVals = opponentHole.map(c => RANK_POWER[c[0]]);
          const oppSum = oppVals.reduce((a, b) => a + b, 0);
          const oppAvg = oppSum / oppVals.length;
          
          // Project a score based on average card strength * 2 (to match 2-card hand weight)
          oppScore += oppAvg * 2;
          
          // Bonus for pairs within opponent range if visible
          const unique = new Set(oppVals);
          if (unique.size < oppVals.length) oppScore += 20; 
      } else {
          // Average random hand score approx 15
          oppScore += 18; 
      }

      // Community Impact (Basic Hit Detection)
      community.forEach(c => {
          const r = RANK_POWER[c[0]];
          // Check for pair with hole
          if (r === h1 || r === h2) myScore += 15;
          
          // Check for opponent hits
          if (opponentHole.length > 0) {
              const oppVals = opponentHole.map(k => RANK_POWER[k[0]]);
              if (oppVals.includes(r)) oppScore += 15;
          }
      });

      // Normalize Win Prob based on score diff
      let winProb = 50 + (myScore - oppScore) * 2;
      winProb = Math.max(0, Math.min(100, winProb));

      // Strategy derivation based on Win Prob
      let fold = 0, call = 0, raise = 0;

      if (winProb > 70) {
          raise = 80; call = 20; fold = 0;
      } else if (winProb > 50) {
          raise = 40; call = 55; fold = 5;
      } else if (winProb > 30) {
          raise = 10; call = 60; fold = 30;
      } else {
          raise = 0; call = 10; fold = 90;
      }

      setStats({ 
          win: Math.round(winProb), 
          fold: Math.round(fold), 
          call: Math.round(call), 
          raise: Math.round(raise) 
      });
  };

  const getSuitIcon = (s: string) => {
    if (s === 'S') return <Spade size={12} className="text-slate-400" fill="currentColor"/>;
    if (s === 'H') return <Heart size={12} className="text-red-500" fill="currentColor"/>;
    if (s === 'D') return <Diamond size={12} className="text-blue-400" fill="currentColor"/>; 
    return <Club size={12} className="text-green-500" fill="currentColor"/>;
  };

  const toggleCard = (card: string) => {
    const isHole = selectionMode === 'hole';
    const isComm = selectionMode === 'community';
    const isOpp = selectionMode === 'opponent';

    // Remove if exists anywhere
    if (hole.includes(card)) { setHole(hole.filter(c => c !== card)); return; }
    if (community.includes(card)) { setCommunity(community.filter(c => c !== card)); return; }
    if (opponentHole.includes(card)) { setOpponentHole(opponentHole.filter(c => c !== card)); return; }

    // Add Logic
    if (isHole && hole.length < 2) setHole([...hole, card]);
    if (isComm && community.length < 5) setCommunity([...community, card]);
    // No limit for opponent cards as requested
    if (isOpp) setOpponentHole([...opponentHole, card]);
  };

  const nextRound = () => {
      setRound(r => r + 1);
      setCommunity([]);
      setHole([]);
      setOpponentHole([]);
      setSelectionMode('hole');
      onLog(`Started Round ${round + 1}`);
  };

  return (
    <div className="flex flex-col h-screen bg-green-950 text-white overflow-hidden">
        {/* Top Header */}
        <div className="p-3 bg-green-900 shadow flex justify-between items-center z-10 shrink-0">
            <button onClick={onBack} className="text-green-200 hover:text-white flex gap-2"><ArrowLeft /> {t.back}</button>
            <div className="flex items-center gap-4">
                 <button onClick={() => setRound(Math.max(1, round - 1))} className="p-1 bg-green-800 rounded"><ChevronLeft/></button>
                 <span className="font-bold text-green-100">{t.round} {round}</span>
                 <button onClick={nextRound} className="p-1 bg-green-800 rounded"><ChevronRight/></button>
            </div>
            <div />
        </div>

        {/* Game State Area */}
        <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-green-900/30">
            
            {/* Community Board */}
            <div 
                onClick={() => setSelectionMode('community')}
                className={`p-2 rounded-xl border-2 transition-colors cursor-pointer ${selectionMode === 'community' ? 'border-yellow-400 bg-black/40' : 'border-green-800 bg-green-900/50'}`}
            >
                <h3 className="text-xs uppercase tracking-wider text-green-300 mb-1">{t.poker.community}</h3>
                <div className="flex gap-2 min-h-[40px] justify-center">
                    {community.map(c => (
                        <div key={c} className="w-8 h-12 bg-white rounded text-black flex flex-col items-center justify-center border-2 border-slate-300 shadow">
                            <span className="font-bold text-sm leading-none">{c.charAt(0)}</span>
                            {getSuitIcon(c.charAt(1))}
                        </div>
                    ))}
                    {community.length === 0 && <span className="text-green-600/50 text-xs italic py-3">{t.poker.select}</span>}
                </div>
            </div>

            <div className="flex gap-2">
                {/* My Hole Cards */}
                <div 
                    onClick={() => setSelectionMode('hole')}
                    className={`flex-1 p-2 rounded-xl border-2 transition-colors cursor-pointer ${selectionMode === 'hole' ? 'border-yellow-400 bg-black/40' : 'border-slate-700 bg-black/20'}`}
                >
                    <h3 className="text-xs uppercase tracking-wider text-yellow-500 mb-1">{t.poker.hole}</h3>
                    <div className="flex gap-2 min-h-[40px] justify-center">
                        {hole.map(c => (
                            <div key={c} className="w-8 h-12 bg-white rounded text-black flex flex-col items-center justify-center border-2 border-yellow-500 shadow-glow transform -translate-y-1">
                                <span className="font-bold text-sm leading-none">{c.charAt(0)}</span>
                                {getSuitIcon(c.charAt(1))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opponent Hole Cards */}
                 <div 
                    onClick={() => setSelectionMode('opponent')}
                    className={`flex-1 p-2 rounded-xl border-2 transition-colors cursor-pointer ${selectionMode === 'opponent' ? 'border-yellow-400 bg-black/40' : 'border-slate-700 bg-black/20'}`}
                >
                    <h3 className="text-xs uppercase tracking-wider text-red-400 mb-1">{t.poker.opponent}</h3>
                    <div className="flex gap-2 flex-wrap min-h-[40px] justify-center">
                        {opponentHole.map(c => (
                            <div key={c} className="w-8 h-12 bg-white rounded text-black flex flex-col items-center justify-center border-2 border-red-500 shadow-glow transform -translate-y-1">
                                <span className="font-bold text-sm leading-none">{c.charAt(0)}</span>
                                {getSuitIcon(c.charAt(1))}
                            </div>
                        ))}
                         {opponentHole.length === 0 && <span className="text-slate-600 text-xs italic py-3">?</span>}
                    </div>
                </div>
            </div>

            {/* Real-time Stats Result */}
             <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-500/50 text-sm mt-4 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-300 font-bold uppercase tracking-wider">Calculated Odds</span>
                    <span className="text-xl font-bold text-green-400">{stats.win}% Win</span>
                </div>
                
                <div className="flex gap-2 text-center text-xs">
                    <div className="flex-1 bg-red-900/40 p-2 rounded border border-red-900">
                        <div className="text-red-300 font-bold mb-1">{t.poker.fold}</div>
                        <div className="text-lg">{stats.fold}%</div>
                    </div>
                    <div className="flex-1 bg-blue-900/40 p-2 rounded border border-blue-900">
                         <div className="text-blue-300 font-bold mb-1">{t.poker.call}</div>
                         <div className="text-lg">{stats.call}%</div>
                    </div>
                    <div className="flex-1 bg-yellow-900/40 p-2 rounded border border-yellow-900">
                         <div className="text-yellow-300 font-bold mb-1">{t.poker.raise}</div>
                         <div className="text-lg">{stats.raise}%</div>
                    </div>
                </div>
             </div>
        </div>

        {/* Visual Selector Area */}
        <div className="bg-slate-900 border-t border-slate-700 p-2 shrink-0 flex flex-col gap-1">
            <div className="text-[10px] text-center text-slate-500 uppercase">
                Selecting: <span className="text-white font-bold">
                    {selectionMode === 'hole' ? t.poker.hole : selectionMode === 'community' ? t.poker.community : t.poker.opponent}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                {SUITS.map(s => (
                    <div key={s} className="flex gap-1 flex-wrap justify-between">
                        {RANKS.map(r => {
                            const card = r + s;
                            const isSelectedHole = hole.includes(card);
                            const isSelectedComm = community.includes(card);
                            const isSelectedOpp = opponentHole.includes(card);
                            const isDisabled = (isSelectedHole || isSelectedComm || isSelectedOpp);
                            
                            return (
                                <button
                                    key={card}
                                    onClick={() => toggleCard(card)}
                                    disabled={isDisabled}
                                    className={`
                                        flex-1 h-8 min-w-[20px] rounded flex items-center justify-center gap-0.5
                                        ${isSelectedHole ? 'bg-yellow-600 text-white shadow-inner' : 
                                          isSelectedComm ? 'bg-green-700 text-white shadow-inner' : 
                                          isSelectedOpp ? 'bg-red-700 text-white shadow-inner' :
                                          'bg-slate-100 text-black hover:bg-slate-300'}
                                        ${isDisabled ? 'opacity-40' : ''}
                                    `}
                                >
                                    <span className="text-[10px] font-bold leading-none">{r}</span>
                                    {getSuitIcon(s)}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default PokerAssistant;
