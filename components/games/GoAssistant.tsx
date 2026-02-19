import React, { useState } from 'react';
import { analyzeGoBoard } from '../../services/localGameLogic'; // Use local
import { ArrowLeft, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onBack: () => void;
  onLog: (msg: string) => void;
}

const BOARD_SIZE = 19;
const STAR_POINTS = [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15]
];

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
const ROWS = Array.from({length: 19}, (_, i) => 19 - i);

const GoAssistant: React.FC<Props> = ({ onBack, onLog }) => {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [board, setBoard] = useState<number[][]>(Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0)));
  const [turn, setTurn] = useState<number>(1); // 1 = Black, 2 = White
  const [stats, setStats] = useState<any>(null);
  
  const GRID_CELL_SIZE = 100 / (BOARD_SIZE - 1); 

  const getPositionStyle = (r: number, c: number) => ({
      top: `${r * GRID_CELL_SIZE}%`,
      left: `${c * GRID_CELL_SIZE}%`,
  });

  const handleIntersectionClick = (r: number, c: number) => {
    const newBoard = board.map(row => [...row]);
    const currentCell = newBoard[r][c];

    if (currentCell === 0) {
        // Place stone (Alternating)
        newBoard[r][c] = turn;
        
        // Log move
        const colorName = turn === 1 ? 'Black' : 'White';
        onLog(`Round ${round}: ${colorName} at ${COLS[c]}${ROWS[r]}`);
        
        // Switch turn
        setTurn(prev => prev === 1 ? 2 : 1);
        
        // Increment round
        setRound(prev => prev + 1);

    } else {
        // Cycle existing stone: Black(1) -> White(2) -> Empty(0)
        if (currentCell === 1) {
            newBoard[r][c] = 2;
        } else if (currentCell === 2) {
            newBoard[r][c] = 0;
        }
        // Note: Manually changing stones does not advance the round or switch turn automatically
    }

    setBoard(newBoard);
    
    // Auto analyze on change locally
    const analysis = analyzeGoBoard(newBoard);
    setStats(analysis);
  };

  const nextRound = () => {
      setRound(r => r + 1);
      onLog(`Started Round ${round + 1}`);
  };

  return (
    <div className="flex flex-col h-screen bg-stone-800 text-stone-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-stone-900 flex justify-between items-center shadow-md z-10 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-white">
          <ArrowLeft size={20} /> {t.back}
        </button>
        <div className="flex items-center gap-4">
            <button onClick={() => setRound(Math.max(1, round - 1))} className="p-1 bg-stone-700 rounded hover:bg-stone-600"><ChevronLeft/></button>
            <div className="flex flex-col items-center">
                <span className="text-xs text-stone-400">{t.round}</span>
                <span className="font-bold text-amber-500 text-xl">{round}</span>
            </div>
            <button onClick={nextRound} className="p-1 bg-stone-700 rounded hover:bg-stone-600"><ChevronRight/></button>
        </div>
        <div className="flex items-center gap-2 bg-stone-800 px-3 py-1 rounded border border-stone-600">
            <span className="text-xs text-stone-400">{t.turn}:</span>
            <span className={`font-bold ${turn === 1 ? 'text-white' : 'text-stone-300'}`}>
                {turn === 1 ? t.go.black : t.go.white}
            </span>
            <div className={`w-3 h-3 rounded-full border ${turn === 1 ? 'bg-black border-white' : 'bg-white border-black'}`} />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
        {/* Board Area */}
        <div className="flex-1 flex justify-center items-center overflow-hidden">
          <div 
            className="relative bg-amber-200 shadow-2xl rounded"
            style={{ 
                width: 'min(100%, 75vh)', 
                height: 'min(100%, 75vh)',
                aspectRatio: '1/1',
            }}
          >
             {/* Coordinate Labels */}
             <div className="absolute top-0 left-6 right-6 h-5 flex justify-between items-end text-black font-bold text-[10px] pointer-events-none">
                 {COLS.map(c => <div key={c} className="flex-1 text-center">{c}</div>)}
             </div>
             <div className="absolute bottom-0 left-6 right-6 h-5 flex justify-between items-start text-black font-bold text-[10px] pointer-events-none">
                 {COLS.map(c => <div key={c} className="flex-1 text-center">{c}</div>)}
             </div>
             <div className="absolute left-0 top-6 bottom-6 w-5 flex flex-col justify-between items-end pr-1 text-black font-bold text-[10px] pointer-events-none">
                 {ROWS.map(r => <div key={r} className="flex-1 flex items-center justify-end">{r}</div>)}
             </div>
             <div className="absolute right-0 top-6 bottom-6 w-5 flex flex-col justify-between items-start pl-1 text-black font-bold text-[10px] pointer-events-none">
                 {ROWS.map(r => <div key={r} className="flex-1 flex items-center justify-start">{r}</div>)}
             </div>

             {/* Inner Board */}
             <div className="absolute inset-6">
                {/* Grid Lines */}
                <div className="w-full h-full border-t border-l border-black relative">
                    {Array(BOARD_SIZE - 1).fill(0).map((_, i) => (
                         <div key={`h-${i}`} className="absolute w-full border-b border-black" style={{ top: `${((i + 1) / (BOARD_SIZE - 1)) * 100}%` }} />
                    ))}
                     {Array(BOARD_SIZE - 1).fill(0).map((_, i) => (
                         <div key={`v-${i}`} className="absolute h-full border-r border-black" style={{ left: `${((i + 1) / (BOARD_SIZE - 1)) * 100}%` }} />
                    ))}
                </div>

                {/* Star Points */}
                {STAR_POINTS.map(([r, c], i) => (
                     <div 
                        key={`star-${i}`}
                        className="absolute bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            ...getPositionStyle(r, c),
                            width: '4px', height: '4px'
                        }}
                     />
                 ))}

                {/* Territory Overlay */}
                {stats?.territoryMap?.map((row: number[], r: number) => (
                    row.map((cell: number, c: number) => (
                        cell !== 0 && (
                        <div 
                            key={`terr-${r}-${c}`}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 rounded-full opacity-50 ${cell === 1 ? 'bg-black' : 'bg-white'}`}
                            style={getPositionStyle(r, c)}
                        />
                    )))
                ))}

                {/* Stones & Liberties Display */}
                {board.map((row, r) => (
                    row.map((cell, c) => {
                        // Find liberty count for this stone
                        let libs = null;
                        if (stats && cell !== 0) {
                            const group = stats.groups.find((g: any) => g.stones.some((s: any) => s.r === r && s.c === c));
                            if (group) libs = group.liberties;
                        }
                        
                        return (
                        <div 
                            key={`${r}-${c}`}
                            onClick={() => handleIntersectionClick(r, c)}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 flex items-center justify-center rounded-full hover:bg-blue-500/30"
                            style={{
                                ...getPositionStyle(r, c),
                                width: `${GRID_CELL_SIZE}%`, 
                                height: `${GRID_CELL_SIZE}%`,
                            }}
                        >
                            {cell !== 0 && (
                                <div 
                                    className={`rounded-full shadow-md flex items-center justify-center text-[8px] font-bold ${cell === 1 ? 'bg-black text-white' : 'bg-white text-black border border-slate-300'}`}
                                    style={{ width: '95%', height: '95%' }}
                                >
                                    {libs !== null && libs < 3 && <span className="text-red-500">{libs}</span>}
                                </div>
                            )}
                        </div>
                    )})
                ))}
             </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-full md:w-72 bg-stone-900 p-4 rounded-xl border border-stone-700 flex flex-col z-20 shadow-xl overflow-hidden shrink-0">
            <h3 className="text-stone-400 font-bold mb-4 flex items-center gap-2"><BarChart2 size={18}/> {t.go.boardStatus}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-black p-3 rounded-lg border border-stone-600">
                    <div className="text-white font-bold text-lg">{t.go.black}</div>
                    <div className="text-xs text-stone-400 mt-1">{t.go.stonesCount}</div>
                    <div className="text-2xl font-mono">{stats?.blackStones || 0}</div>
                    <div className="text-xs text-stone-400 mt-1">{t.go.territoryCount}</div>
                    <div className="text-xl font-mono text-green-400">+{stats?.blackTerritory || 0}</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-stone-300">
                    <div className="text-black font-bold text-lg">{t.go.white}</div>
                    <div className="text-xs text-stone-500 mt-1">{t.go.stonesCount}</div>
                    <div className="text-2xl font-mono text-black">{stats?.whiteStones || 0}</div>
                    <div className="text-xs text-stone-500 mt-1">{t.go.territoryCount}</div>
                    <div className="text-xl font-mono text-green-600">+{stats?.whiteTerritory || 0}</div>
                </div>
            </div>
            
            <div className="mt-4 text-xs text-stone-500 space-y-1">
                <p>{t.go.libertyNote}</p>
                <p>{t.go.territoryNote}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GoAssistant;