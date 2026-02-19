import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh' | 'ja';

const translations = {
  en: {
    appTitle: "Game Assistant",
    selectGame: "Select a game to begin analysis",
    history: "History",
    noHistory: "No history yet. Play a game!",
    back: "Exit",
    turn: "Turn",
    controls: "Controls",
    analyze: "Analyze",
    thinking: "Thinking...",
    waiting: "Waiting for analysis...",
    round: "Round",
    prevRound: "Prev",
    nextRound: "Next",
    clear: "Clear",
    author: "Author",
    share: "Share",
    shareSuccess: "Link copied! You can forward it to others.",
    games: {
      GO: "Go Assistant",
      POKER: "Texas Hold'em",
      GUANDAN: "Guandan",
      MAHJONG: "Mahjong",
      XIANGQI: "Xiangqi"
    },
    go: {
      desc: "Tap grid to toggle stones. Setup board, then ask AI.",
      black: "BLACK",
      white: "WHITE",
      suggestion: "AI Suggestion",
      boardStatus: "Board Status",
      stonesCount: "Stones",
      territoryCount: "Territory",
      libertyNote: "* Liberties < 3 shown in red on stones.",
      territoryNote: "* Territory estimated by surrounded empty points."
    },
    poker: {
      community: "Community Cards",
      hole: "My Hole Cards",
      opponent: "Opponent(s)",
      select: "Select cards...",
      winProb: "Win Prob",
      fold: "Fold",
      call: "Call",
      raise: "Raise",
      calculate: "Calculate Odds"
    },
    guandan: {
      handLabel: "My Hand",
      playedLabel: "Opponent's Last Play",
      check: "Sort & Find Bombs",
      strategy: "Strategy",
      placeholderHand: "Select cards below...",
      placeholderPlayed: "Select cards below...",
      bombsFound: "Bombs Found & Grouped"
    },
    mahjong: {
      rule: "Rule",
      myTiles: "My Hand",
      discards: "Table Discards",
      calculate: "Calculate Hu & Points",
      result: "Analysis Result",
      enterHand: "Select tiles...",
      enterDiscards: "Select tiles...",
      winTile: "Win",
      fan: "Fan"
    },
    xiangqi: {
      fenLabel: "Board Setup",
      bestMove: "Find Best Move",
      calculating: "Calculating...",
      resultBest: "Best Move",
      reasoning: "Reasoning",
      palette: "Piece Palette (Select & Place)"
    }
  },
  zh: {
    appTitle: "游戏辅助器",
    selectGame: "选择一个游戏开始分析",
    history: "历史记录",
    noHistory: "暂无记录，快去玩一局吧！",
    back: "退出",
    turn: "当前回合",
    controls: "操作",
    analyze: "开始分析",
    thinking: "思考中...",
    waiting: "等待分析...",
    round: "轮次",
    prevRound: "上一轮",
    nextRound: "下一轮",
    clear: "清空",
    author: "作者",
    share: "分享",
    shareSuccess: "链接已复制！您可以转发给其他人。",
    games: {
      GO: "围棋助手",
      POKER: "德扑助手",
      GUANDAN: "掼蛋助手",
      MAHJONG: "麻将助手",
      XIANGQI: "象棋助手"
    },
    go: {
      desc: "点击棋盘摆放棋子。摆好后询问AI。",
      black: "黑方",
      white: "白方",
      suggestion: "AI 建议",
      boardStatus: "棋局状态",
      stonesCount: "棋子数",
      territoryCount: "地盘(目)",
      libertyNote: "* 气数少于3口的棋子显示红色数字",
      territoryNote: "* 地盘由被包围的空点估算"
    },
    poker: {
      community: "公共牌",
      hole: "我的手牌",
      opponent: "对手手牌",
      select: "请选择...",
      winProb: "胜率",
      fold: "弃牌",
      call: "跟注",
      raise: "加注",
      calculate: "计算赔率"
    },
    guandan: {
      handLabel: "我的手牌",
      playedLabel: "对手刚出的牌",
      check: "理牌 & 找炸弹",
      strategy: "策略建议",
      placeholderHand: "在下方选择...",
      placeholderPlayed: "在下方选择...",
      bombsFound: "已发现炸弹并理牌"
    },
    mahjong: {
      rule: "规则",
      myTiles: "我的手牌",
      discards: "牌河已出",
      calculate: "计算胡牌与番数",
      result: "分析结果",
      enterHand: "在下方选择...",
      enterDiscards: "在下方选择...",
      winTile: "胡",
      fan: "番"
    },
    xiangqi: {
      fenLabel: "棋局设置",
      bestMove: "寻找最佳着法",
      calculating: "计算中...",
      resultBest: "最佳着法",
      reasoning: "推演理由",
      palette: "棋子库 (点击选择后放置)"
    }
  },
  ja: {
    appTitle: "ゲームアシスタント",
    selectGame: "ゲームを選択して分析を開始",
    history: "履歴",
    noHistory: "履歴がありません。",
    back: "終了",
    turn: "手番",
    controls: "操作",
    analyze: "分析開始",
    thinking: "考え中...",
    waiting: "分析待ち...",
    round: "ラウンド",
    prevRound: "前へ",
    nextRound: "次へ",
    clear: "クリア",
    author: "作者",
    share: "共有",
    shareSuccess: "リンクをコピーしました！友達と共有できます。",
    games: {
      GO: "囲碁アシスタント",
      POKER: "テキサスホールデム",
      GUANDAN: "Guandan (中国ポーカー)",
      MAHJONG: "麻雀アシスタント",
      XIANGQI: "シャンチー (中国将棋)"
    },
    go: {
      desc: "グリッドをタップして石を置きます。配置後にAIに尋ねてください。",
      black: "黒番",
      white: "白番",
      suggestion: "AIの提案",
      boardStatus: "盤面ステータス",
      stonesCount: "石数",
      territoryCount: "地（目）",
      libertyNote: "* 呼吸点が3未満の石は赤字で表示",
      territoryNote: "* 地は囲まれた空点から推定されます"
    },
    poker: {
      community: "コミュニティカード",
      hole: "ハンド（手札）",
      opponent: "相手のハンド",
      select: "選択...",
      winProb: "勝率",
      fold: "フォールド",
      call: "コール",
      raise: "レイズ",
      calculate: "オッズ計算"
    },
    guandan: {
      handLabel: "手札",
      playedLabel: "相手が出したカード",
      check: "ソート & ボム検索",
      strategy: "戦略",
      placeholderHand: "下から選択...",
      placeholderPlayed: "下から選択...",
      bombsFound: "ボムが見つかりました"
    },
    mahjong: {
      rule: "ルール",
      myTiles: "手牌",
      discards: "捨て牌",
      calculate: "和了と点数を計算",
      result: "分析結果",
      enterHand: "下から選択...",
      enterDiscards: "下から選択...",
      winTile: "和",
      fan: "翻"
    },
    xiangqi: {
      fenLabel: "盤面設定",
      bestMove: "最善手を探す",
      calculating: "計算中...",
      resultBest: "最善手",
      reasoning: "理由",
      palette: "駒パレット (選択して配置)"
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh'); 
  
  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};