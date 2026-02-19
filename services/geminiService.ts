import { GoogleGenAI, Type } from "@google/genai";
import { MahjongRule } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview for fast reasoning, or pro for deep analysis
const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_SMART = 'gemini-3-pro-preview';

const getLangInstruction = (lang: string) => {
    switch(lang) {
        case 'zh': return "Respond in Simplified Chinese (简体中文).";
        case 'ja': return "Respond in Japanese (日本語).";
        default: return "Respond in English.";
    }
};

export const getGoSuggestion = async (boardState: number[][], turn: 'black' | 'white', lang: string): Promise<any> => {
  // Convert 2D array to readable string
  const boardStr = boardState.map(row => row.map(c => c === 0 ? '.' : c === 1 ? 'B' : 'W').join(' ')).join('\n');
  
  const prompt = `
    You are a Go (Weiqi) expert assistant using AlphaZero-style positional judgment.
    ${getLangInstruction(lang)}
    Current Board (19x19, B=Black, W=White, .=Empty):
    ${boardStr}
    
    It is ${turn}'s turn.
    1. Identify the best next move.
    2. Predict the next 4 moves after that (total 5 steps sequence).
    3. Briefly explain the strategy.

    Return JSON format:
    {
        "sequence": [
            {"r": 3, "c": 15, "color": "black"}, // Step 1 (Best move) (0-indexed row/col)
            {"r": 15, "c": 3, "color": "white"}  // Step 2
            // ... up to 5 steps
        ],
        "explanation": "Strategy description..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                sequence: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            r: { type: Type.NUMBER },
                            c: { type: Type.NUMBER },
                            color: { type: Type.STRING }
                        }
                    }
                },
                explanation: { type: Type.STRING }
            }
          }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error(error);
    return { sequence: [], explanation: "Error analyzing Go board." };
  }
};

// Poker is now calculated locally, removing getPokerAnalysis from here or leaving it unused.
// We will keep other services.

export const getGuandanAnalysis = async (hand: string[], played: string[], lang: string): Promise<string> => {
  const prompt = `
    You are a Guandan expert.
    ${getLangInstruction(lang)}
    My Hand: ${hand.join(', ')}
    Previously Played by others recently: ${played.join(', ')}
    
    1. List all bomb combinations in my hand.
    2. Suggest the best play structure (Straight, Pairs, etc.) to clear the hand.
    3. Estimate if I can control the lead.
  `;
  try {
    const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt
    });
    return response.text || "No analysis.";
  } catch (e) { return "Error"; }
};

export const getMahjongSuggestion = async (hand: string[], discards: string[], rule: MahjongRule, lang: string): Promise<string> => {
  const prompt = `
    You are a Mahjong master. Rule: ${rule}.
    ${getLangInstruction(lang)}
    My Hand: ${hand.join(', ')}
    Discards on table: ${discards.join(', ')}
    
    1. What tiles am I waiting for (Ting)?
    2. For each winning tile, calculate the Fan/Multiplier/Points based on ${rule} rules.
    3. What should I discard next to maximize probability?
  `;
  
  try {
    const response = await ai.models.generateContent({
        model: MODEL_SMART,
        contents: prompt
    });
    return response.text || "No analysis.";
  } catch (e) { return "Error"; }
};

export const getXiangqiBestMove = async (fen: string, history: string[], lang: string): Promise<any> => {
  const prompt = `
    You are a Xiangqi (Chinese Chess) Grandmaster engine.
    ${getLangInstruction(lang)}
    Current FEN: ${fen}
    History: ${history.join(' -> ')}
    
    1. Identify the BEST next move.
    2. Predict the next 5 plies (half-moves) starting with this best move.
    
    Return JSON.
    Keys must remain in English (bestMove, reasoning, futureSteps).
    Reasoning should be in the requested language.
  `;

  try {
    const response = await ai.models.generateContent({
        model: MODEL_SMART,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    bestMove: { type: Type.STRING, description: "Standard notation, e.g. H2+3" },
                    reasoning: { type: Type.STRING },
                    futureSteps: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "Array of next 5 moves in notation" 
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return { bestMove: "Error", futureSteps: [] }; }
};
