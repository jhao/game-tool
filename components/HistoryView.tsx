import React from 'react';
import { GameSession, GameType } from '../types';
import { ArrowLeft, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  history: GameSession[];
  onBack: () => void;
}

const HistoryView: React.FC<Props> = ({ history, onBack }) => {
  const { t } = useLanguage();
  
  // Helper to get translated name from enum
  const getGameName = (type: GameType) => {
    return t.games[type] || type;
  };

  return (
    <div className="p-4 h-full overflow-y-auto bg-slate-900">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full mr-4 hover:bg-slate-700">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock /> {t.history}
        </h2>
      </div>

      {history.length === 0 ? (
        <div className="text-slate-500 text-center mt-20">{t.noHistory}</div>
      ) : (
        <div className="space-y-4">
          {history.map((game) => (
            <div key={game.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg text-blue-400">{getGameName(game.type)}</span>
                <span className="text-sm text-slate-400">{new Date(game.date).toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded text-sm font-mono text-slate-300 max-h-32 overflow-y-auto">
                 {game.log.slice(0, 5).map((l, i) => <div key={i}>{l}</div>)}
                 {game.log.length > 5 && <div className="text-xs text-slate-500 mt-1">... and {game.log.length - 5} more</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
