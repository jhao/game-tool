export enum GameType {
  GO = 'GO',
  POKER = 'POKER',
  GUANDAN = 'GUANDAN',
  MAHJONG = 'MAHJONG',
  XIANGQI = 'XIANGQI',
}

export interface GameSession {
  id: string;
  type: GameType;
  date: string;
  log: string[]; // Text description of moves for history
}

export type MahjongRule = 'National' | 'Tianjin' | 'Sichuan' | 'Riichi' | 'Taiwan';

// Specific State Interfaces
export interface GoState {
  board: number[][]; // 0 empty, 1 black, 2 white
  turn: 'black' | 'white';
}

export interface PokerState {
  myHole: string[];
  community: string[];
  stage: 'pre-flop' | 'flop' | 'turn' | 'river';
}

export interface XiangqiState {
  fen: string; // Standard notation for board state
}
