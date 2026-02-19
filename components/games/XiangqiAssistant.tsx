import React, { useState } from 'react';
import { getXiangqiBestMoveLocal } from '../../services/localGameLogic'; // Local
import { ArrowLeft, Move, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onBack: () => void;
  onLog: (msg: string) => void;
}

const INITIAL_BOARD = [
    'r','n','b','a','k','a','b','n','r', // 0
    '','','','','','','','','',         // 1
    '','c','','','','','','c','',         // 2
    'p','','p','','p','','p','','p',     // 3
    '','','','','','','','','',         // 4
    '','','','','','','','','',         // 5
    'P','','P','','P','','P','','P',     // 6
    '','C','','','','','','C','',         // 7
    '','','','','','','','','',         // 8
    'R','N','B','A','K','A','B','N','R'  // 9
];

const PIECES_PALETTE = [
    { id: 'R', label: '車', color: 'red', count: 2 },
    { id: 'N', label: '馬', color: 'red', count: 2 },
    { id: 'B', label: '相', color: 'red', count: 2 },
    { id: 'A', label: '仕', color: 'red', count: 2 },
    { id: 'K', label: '帥', color: 'red', count: 1 },
    { id: 'C', label: '炮', color: 'red', count: 2 },
    { id: 'P', label: '兵', color: 'red', count: 5 },
    { id: 'r', label: '車', color: 'black', count: 2 },
    { id: 'n', label: '馬', color: 'black', count: 2 },
    { id: 'b', label: '象', color: 'black', count: 2 },
    { id: 'a', label: '士', color: 'black', count: 2 },
    { id: 'k', label: '將', color: 'black', count: 1 },
    { id: 'c', label: '炮', color: 'black', count: 2 },
    { id: 'p', label: '卒', color: 'black', count: 5 },
];

const getPieceLabel = (id: string) => {
    const p = PIECES_PALETTE.find(x => x.id === id);
    return p ? p.label : '';
};
const getPieceColor = (id: string) => {
     const p = PIECES_PALETTE.find(x => x.id === id);
    return p ? p.color : '';
};

const XiangqiAssistant: React.FC<Props> = ({ onBack, onLog }) => {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [board, setBoard] = useState<string[]>(INITIAL_BOARD.flat()); 
  const [result, setResult] = useState<any>(null);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const getBoardCount = (pieceId: string) => board.filter(p => p === pieceId).length;

  const handleBoardClick = (index: number) => {
      if (selectedPiece) {
          const newBoard = [...board];
          const limit = PIECES_PALETTE.find(p => p.id === selectedPiece)?.count || 0;
          if (getBoardCount(selectedPiece) < limit) {
             newBoard[index] = selectedPiece;
             setBoard(newBoard);
             setSelectedPiece(null); 
          }
      } else {
          const piece = board[index];
          if (piece) {
              setSelectedPiece(piece);
              const newBoard = [...board];
              newBoard[index] = '';
              setBoard(newBoard);
          }
      }
  };

  const analyze = () => {
    // Local calculation
    const data = getXiangqiBestMoveLocal(board);
    setResult(data);
    onLog(`Round ${round}: ${data.bestMove}`);
  };

  const nextRound = () => {
      setRound(r => r + 1);
      onLog(`Started Round ${round + 1}`);
  };

  // SVG Helper for grid lines
  const GridLines = () => (
      <svg viewBox="0 0 900 1000" className="absolute inset-0 w-full h-full pointer-events-none">
          <rect x="0" y="0" width="900" height="1000" fill="transparent" />
          {Array.from({length: 10}).map((_, i) => (
              <line key={`h${i}`} x1="50" y1={50 + i*100} x2="850" y2={50 + i*100} stroke="#000" strokeWidth="2" />
          ))}
          {Array.from({length: 9}).map((_, i) => (
              <line key={`vt${i}`} x1={50 + i*100} y1="50" x2={50 + i*100} y2="450" stroke="#000" strokeWidth="2" />
          ))}
          {Array.from({length: 9}).map((_, i) => (
               <line key={`vb${i}`} x1={50 + i*100} y1="550" x2={50 + i*100} y2="950" stroke="#000" strokeWidth="2" />
          ))}
          <line x1="50" y1="450" x2="50" y2="550" stroke="#000" strokeWidth="2" />
          <line x1="850" y1="450" x2="850" y2="550" stroke="#000" strokeWidth="2" />
          <line x1="350" y1="50" x2="550" y2="250" stroke="#000" strokeWidth="2" />
          <line x1="550" y1="50" x2="350" y2="250" stroke="#000" strokeWidth="2" />
          <line x1="350" y1="750" x2="550" y2="950" stroke="#000" strokeWidth="2" />
          <line x1="550" y1="750" x2="350" y2="950" stroke="#000" strokeWidth="2" />
      </svg>
  );

  return (
    <div className="flex flex-col h-screen bg-amber-950 text-amber-100 overflow-hidden">
       <div className="p-2 bg-amber-900 flex justify-between items-center shadow-lg shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 hover:text-white text-sm">
          <ArrowLeft size={18} /> {t.back}
        </button>
        <div className="flex items-center gap-4">
             <button onClick={() => setRound(Math.max(1, round - 1))} className="p-1 bg-amber-800 rounded"><ChevronLeft size={16}/></button>
             <span className="font-bold text-sm">{t.round} {round}</span>
             <button onClick={nextRound} className="p-1 bg-amber-800 rounded"><ChevronRight size={16}/></button>
        </div>
        <div />
      </div>

      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
        
        {/* Board Visualization */}
        <div className="flex-1 relative bg-[#eebb77] rounded shadow-2xl border-2 border-amber-900 overflow-hidden flex items-center justify-center select-none">
            <div className="relative w-full h-full max-w-[50vh] aspect-[9/10]">
                <GridLines />
                <div className="absolute top-[45%] left-0 right-0 h-[10%] flex items-center justify-around pointer-events-none">
                     <span className="text-2xl text-amber-900/40 font-serif rotate-0">楚河</span>
                     <span className="text-2xl text-amber-900/40 font-serif rotate-0">漢界</span>
                </div>

                <div className="absolute inset-0 grid grid-cols-9 grid-rows-10" 
                     style={{ padding: '2.5% 2.5%' }} 
                >
                    {board.map((piece, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleBoardClick(i)}
                            className="relative flex items-center justify-center cursor-pointer"
                        >
                            {piece && (
                                <div className={`
                                    w-[90%] h-[90%] rounded-full border-2 bg-[#f0dcb0] shadow-md flex items-center justify-center
                                    ${getPieceColor(piece) === 'red' ? 'border-red-600 text-red-600' : 'border-black text-black'}
                                `}>
                                    <span className="font-bold text-xl leading-none">{getPieceLabel(piece)}</span>
                                </div>
                            )}
                            {selectedPiece && !piece && (
                                <div className="w-4 h-4 rounded-full bg-green-500/20 opacity-0 hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Controls & Palette */}
        <div className="h-[35vh] bg-amber-900/50 p-2 rounded-xl border border-amber-800 flex flex-col gap-2 shrink-0">
            {/* Palette */}
            <div className="bg-black/20 p-2 rounded overflow-y-auto max-h-[15vh]">
                <div className="text-xs text-amber-300 mb-1 flex justify-between">
                    <span>{t.xiangqi.palette}</span>
                    <span className="text-amber-500">{selectedPiece ? `Selected: ${getPieceLabel(selectedPiece)}` : 'Click to pick up'}</span>
                </div>
                
                {/* Red Pieces */}
                <div className="flex gap-2 flex-wrap mb-2">
                    {PIECES_PALETTE.filter(p => p.color === 'red').map(p => {
                        const currentCount = getBoardCount(p.id);
                        const disabled = currentCount >= p.count;
                        return (
                        <button 
                            key={p.id} 
                            onClick={() => setSelectedPiece(p.id)}
                            disabled={disabled}
                            className={`w-8 h-8 rounded-full bg-[#f0dcb0] border-2 border-red-600 text-red-600 font-bold flex items-center justify-center shrink-0 
                                ${selectedPiece === p.id ? 'ring-2 ring-white scale-110' : ''}
                                ${disabled ? 'opacity-30 cursor-not-allowed filter grayscale' : ''}
                            `}
                        >
                            {p.label}
                        </button>
                    )})}
                </div>
                {/* Black Pieces */}
                <div className="flex gap-2 flex-wrap">
                     {PIECES_PALETTE.filter(p => p.color === 'black').map(p => {
                         const currentCount = getBoardCount(p.id);
                         const disabled = currentCount >= p.count;
                         return (
                        <button 
                            key={p.id} 
                            onClick={() => setSelectedPiece(p.id)}
                            disabled={disabled}
                            className={`w-8 h-8 rounded-full bg-[#f0dcb0] border-2 border-black text-black font-bold flex items-center justify-center shrink-0 
                                ${selectedPiece === p.id ? 'ring-2 ring-white scale-110' : ''}
                                ${disabled ? 'opacity-30 cursor-not-allowed filter grayscale' : ''}
                            `}
                        >
                            {p.label}
                        </button>
                    )})}
                </div>
            </div>

            {/* Action */}
            <button 
                onClick={analyze} 
                className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded shadow flex justify-center items-center gap-2"
            >
               <Move size={16} /> {t.xiangqi.bestMove} (Red)
            </button>

            {/* Results */}
            {result && (
                <div className="flex-1 bg-black/40 rounded border border-amber-700 p-2 overflow-y-auto">
                    <div className="font-bold text-red-400 text-xl mb-1 text-center">{result.bestMove}</div>
                    <p className="text-amber-200 text-xs mb-2 leading-relaxed opacity-70">{result.reasoning}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default XiangqiAssistant;
