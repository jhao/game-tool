import React, { useState, useEffect } from 'react';
import GameSelector from './components/GameSelector';
import HistoryView from './components/HistoryView';
import GoAssistant from './components/games/GoAssistant';
import PokerAssistant from './components/games/PokerAssistant';
import GuandanAssistant from './components/games/GuandanAssistant';
import MahjongAssistant from './components/games/MahjongAssistant';
import XiangqiAssistant from './components/games/XiangqiAssistant';
import { GameType, GameSession } from './types';

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [history, setHistory] = useState<GameSession[]>([]);
  const [currentSessionLog, setCurrentSessionLog] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('game_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (type: GameType, log: string[]) => {
    if (log.length === 0) return;
    const newSession: GameSession = {
      id: Date.now().toString(),
      type,
      date: new Date().toISOString(),
      log
    };
    const updated = [newSession, ...history];
    setHistory(updated);
    localStorage.setItem('game_history', JSON.stringify(updated));
  };

  const handleGameSelect = (type: GameType) => {
    setActiveGame(type);
    setCurrentSessionLog([]);
    setViewingHistory(false);
  };

  const handleBack = () => {
    if (activeGame) {
      saveHistory(activeGame, currentSessionLog);
    }
    setActiveGame(null);
    setViewingHistory(false);
  };

  const logMove = (msg: string) => {
    setCurrentSessionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  if (viewingHistory) {
    return <HistoryView history={history} onBack={() => setViewingHistory(false)} />;
  }

  if (!activeGame) {
    return <GameSelector onSelect={handleGameSelect} onViewHistory={() => setViewingHistory(true)} />;
  }

  switch (activeGame) {
    case GameType.GO:
      return <GoAssistant onBack={handleBack} onLog={logMove} />;
    case GameType.POKER:
      return <PokerAssistant onBack={handleBack} onLog={logMove} />;
    case GameType.GUANDAN:
      return <GuandanAssistant onBack={handleBack} onLog={logMove} />;
    case GameType.MAHJONG:
      return <MahjongAssistant onBack={handleBack} onLog={logMove} />;
    case GameType.XIANGQI:
      return <XiangqiAssistant onBack={handleBack} onLog={logMove} />;
    default:
      return <div>Unknown Game</div>;
  }
};

export default App;
