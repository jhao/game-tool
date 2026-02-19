import { MahjongRule } from "../types";

// LOCAL GAME LOGIC SERVICE
// Contains algorithms for Go, Guandan, Mahjong, and Xiangqi without external AI.

// --- GO (WEIQI) LOGIC ---

type GoBoard = number[][]; // 0=Empty, 1=Black, 2=White
type Point = { r: number, c: number };

export const analyzeGoBoard = (board: GoBoard) => {
    const size = board.length;
    const visited = new Set<string>();
    const groups: { color: number, stones: Point[], liberties: number }[] = [];
    
    // 1. Identify Groups and Liberties
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const color = board[r][c];
            if (color === 0 || visited.has(`${r},${c}`)) continue;

            const groupStones: Point[] = [];
            const groupLiberties = new Set<string>();
            const queue: Point[] = [{r, c}];
            visited.add(`${r},${c}`);
            
            while (queue.length > 0) {
                const p = queue.shift()!;
                groupStones.push(p);

                const neighbors = [
                    {r: p.r+1, c: p.c}, {r: p.r-1, c: p.c},
                    {r: p.r, c: p.c+1}, {r: p.r, c: p.c-1}
                ];

                for (const n of neighbors) {
                    if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
                        const nColor = board[n.r][n.c];
                        if (nColor === 0) {
                            groupLiberties.add(`${n.r},${n.c}`);
                        } else if (nColor === color && !visited.has(`${n.r},${n.c}`)) {
                            visited.add(`${n.r},${n.c}`);
                            queue.push(n);
                        }
                    }
                }
            }
            groups.push({ color, stones: groupStones, liberties: groupLiberties.size });
        }
    }

    // 2. Estimate Territory (Flood fill empty areas)
    let blackTerritory = 0;
    let whiteTerritory = 0;
    const territoryMap = Array(size).fill(0).map(() => Array(size).fill(0)); // 0=Neutral, 1=B_Terr, 2=W_Terr
    
    const emptyVisited = new Set<string>();
    
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== 0 || emptyVisited.has(`${r},${c}`)) continue;

            const region: Point[] = [];
            const boundaries = new Set<number>();
            const q: Point[] = [{r, c}];
            emptyVisited.add(`${r},${c}`);
            let isNeutral = false;

            while (q.length > 0) {
                const p = q.shift()!;
                region.push(p);

                const neighbors = [
                    {r: p.r+1, c: p.c}, {r: p.r-1, c: p.c},
                    {r: p.r, c: p.c+1}, {r: p.r, c: p.c-1}
                ];

                for (const n of neighbors) {
                    if (n.r < 0 || n.r >= size || n.c < 0 || n.c >= size) continue;
                    const nColor = board[n.r][n.c];
                    if (nColor === 0) {
                        if (!emptyVisited.has(`${n.r},${n.c}`)) {
                            emptyVisited.add(`${n.r},${n.c}`);
                            q.push(n);
                        }
                    } else {
                        boundaries.add(nColor);
                    }
                }
            }

            if (boundaries.size === 1) {
                const owner = boundaries.values().next().value;
                if (owner === 1) {
                    blackTerritory += region.length;
                    region.forEach(p => territoryMap[p.r][p.c] = 1);
                } else if (owner === 2) {
                    whiteTerritory += region.length;
                    region.forEach(p => territoryMap[p.r][p.c] = 2);
                }
            }
        }
    }

    const blackStones = groups.filter(g => g.color === 1).reduce((acc, g) => acc + g.stones.length, 0);
    const whiteStones = groups.filter(g => g.color === 2).reduce((acc, g) => acc + g.stones.length, 0);

    return {
        blackStones,
        whiteStones,
        blackTerritory,
        whiteTerritory,
        groups, // Includes liberty counts
        territoryMap
    };
};

// --- GUANDAN LOGIC ---

// Ranks order: 2,3,4,5,6,7,8,9,T,J,Q,K,A.
const GD_RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const getGuandanValue = (card: string) => {
    if (card === 'SJ') return 100;
    if (card === 'BJ') return 101;
    const r = card.slice(0, -1);
    return GD_RANKS.indexOf(r);
};

export const analyzeGuandan = (hand: string[]) => {
    // 1. Basic Sort
    const basicSort = (cards: string[]) => {
        return [...cards].sort((a, b) => {
            const va = getGuandanValue(a);
            const vb = getGuandanValue(b);
            if (va !== vb) return va - vb;
            // Sort by suit (H, D, C, S)
            const suits = ['H', 'D', 'C', 'S']; 
            const sa = a.length > 1 ? suits.indexOf(a.slice(-1)) : 0;
            const sb = b.length > 1 ? suits.indexOf(b.slice(-1)) : 0;
            return sa - sb;
        });
    };

    const sortedHand = basicSort(hand);

    // 2. Find Bombs
    const bombs: string[][] = [];
    
    // Frequency map
    const counts: Record<string, string[]> = {};
    sortedHand.forEach(c => {
        const r = c.length === 2 ? c[0] : c; // Rank or Joker
        if (!counts[r]) counts[r] = [];
        counts[r].push(c);
    });

    // 4+ of a kind (Bomb)
    for (const r in counts) {
        if (counts[r].length >= 4) {
            bombs.push(counts[r]);
        }
    }

    // 4 Kings (4 Jokers)
    const jokers = sortedHand.filter(c => c === 'SJ' || c === 'BJ');
    if (jokers.length === 4) {
        bombs.push(jokers);
    }

    // Straight Flush (5 cards)
    const bySuit: Record<string, string[]> = { 'H': [], 'D': [], 'C': [], 'S': [] };
    sortedHand.forEach(c => {
        if (c === 'SJ' || c === 'BJ') return; // Skip Jokers
        if (c.length === 2) {
             const s = c[1];
             if (bySuit[s]) bySuit[s].push(c);
        }
    });

    for (const s in bySuit) {
        const cards = bySuit[s];
        if (cards.length < 5) continue;
        for (let i = 0; i <= cards.length - 5; i++) {
            const subset = cards.slice(i, i+5);
            const indices = subset.map(c => GD_RANKS.indexOf(c[0]));
            let isSeq = true;
            for (let j = 0; j < 4; j++) {
                if (indices[j+1] !== indices[j] + 1) { isSeq = false; break; }
            }
            if (isSeq) bombs.push(subset);
        }
    }

    // 3. Structured Sort: Bombs first, then remainder
    const usedInBombs = new Set<string>();
    bombs.forEach(b => b.forEach(c => usedInBombs.add(c))); 
    
    const structuredHand: string[] = [];
    // Flatten bombs
    bombs.forEach(bomb => {
        bomb.forEach(bc => structuredHand.push(bc));
    });

    // To handle card counts properly (since usedInBombs is set of strings but we might have duplicates)
    // we rebuild the remaining cards.
    const bombCounts: Record<string, number> = {};
    structuredHand.forEach(c => bombCounts[c] = (bombCounts[c] || 0) + 1);
    
    const finalHand: string[] = [...structuredHand];
    
    // Add cards that weren't used in bombs
    const processedCounts: Record<string, number> = {};
    sortedHand.forEach(c => {
        const used = bombCounts[c] || 0;
        const processed = processedCounts[c] || 0;
        if (processed < used) {
            processedCounts[c] = processed + 1;
        } else {
            finalHand.push(c);
        }
    });

    return { sortedHand: finalHand, bombs };
};

// --- MAHJONG LOGIC ---

const TILES_ORDER = [
    '1m','2m','3m','4m','5m','6m','7m','8m','9m', // Man (Wan)
    '1p','2p','3p','4p','5p','6p','7p','8p','9p', // Pin (Tong)
    '1s','2s','3s','4s','5s','6s','7s','8s','9s', // Sou (Tiao)
    'E','S','W','N','P','F','C' // Honors
];

// Helper: Check for HU
const isMahjongHu = (counts: number[]) => {
    const pairs = counts.filter(c => c >= 2).length;
    const totalTiles = counts.reduce((a,b) => a+b, 0);
    if (totalTiles === 14 && pairs === 7) return true; // 7 pairs

    const tryRemoveSet = (c: number[], depth: number): boolean => {
        if (depth === 4) return true; 
        let first = -1;
        for (let i=0; i<34; i++) { if (c[i] > 0) { first = i; break; } }
        if (first === -1) return true;

        if (c[first] >= 3) {
            c[first] -= 3;
            if (tryRemoveSet(c, depth + 1)) return true;
            c[first] += 3;
        }

        if (first < 27 && c[first] > 0 && c[first+1] > 0 && c[first+2] > 0) {
            const suit = Math.floor(first / 9);
            if (Math.floor((first+1)/9) === suit && Math.floor((first+2)/9) === suit) {
                c[first]--; c[first+1]--; c[first+2]--;
                if (tryRemoveSet(c, depth + 1)) return true;
                c[first]++; c[first+1]++; c[first+2]++;
            }
        }
        return false;
    };

    for (let i=0; i<34; i++) {
        if (counts[i] >= 2) {
            const cClone = [...counts];
            cClone[i] -= 2;
            if (tryRemoveSet(cClone, 0)) return true;
        }
    }
    return false;
};

// Calculate Fan based on rule
const calculateFan = (handCounts: number[], winTileIdx: number, rule: MahjongRule): { points: number, label: string } => {
    let points = 0;
    let label = "";

    // Generic Rules
    // Check Pung of Dragons (31=P, 32=F, 33=C)
    if (handCounts[31] >= 3 || handCounts[32] >= 3 || handCounts[33] >= 3) {
        points += 1; label += "Dragon Pung ";
    }
    
    // Tianjin Rules
    if (rule === 'Tianjin') {
        // Zhuo Wu (Catch 5 Wan) - If winning tile is 5m (idx 4)
        if (winTileIdx === 4) {
             points += 1; label += "Zhuo Wu (5 Wan) ";
        }
        // Hun (Mixed One Suit) - Check if only one suit + honors
        const suitsPresent = new Set<number>();
        let hasHonors = false;
        for(let i=0; i<34; i++) {
            if (handCounts[i] > 0) {
                if (i < 27) suitsPresent.add(Math.floor(i/9));
                else hasHonors = true;
            }
        }
        if (suitsPresent.size === 1 && hasHonors) {
            points += 3; label += "Hun Yi Se ";
        }
        if (suitsPresent.size === 1 && !hasHonors) {
            points += 6; label += "Qing Yi Se ";
        }
    }

    // Default National
    if (rule === 'National' || points === 0) {
        if (points === 0) { points = 1; label = "Ping Hu"; }
    }

    return { points, label };
};

export const analyzeMahjong = (hand: string[], rule: MahjongRule = 'National') => {
    const counts = Array(34).fill(0);
    hand.forEach(t => {
        const idx = TILES_ORDER.indexOf(t);
        if (idx !== -1) counts[idx]++;
    });

    const waitingResults: { tile: string, fan: number, label: string }[] = [];
    
    if (hand.length === 13) {
        for (let i = 0; i < 34; i++) {
            if (counts[i] >= 4) continue;
            counts[i]++;
            if (isMahjongHu(counts)) {
                // Calculate Fan
                const fanData = calculateFan(counts, i, rule);
                waitingResults.push({
                    tile: TILES_ORDER[i],
                    fan: fanData.points,
                    label: fanData.label
                });
            }
            counts[i]--;
        }
    }

    return {
        sortedHand: [...hand].sort((a,b) => TILES_ORDER.indexOf(a) - TILES_ORDER.indexOf(b)),
        waitingResults
    };
};

// --- XIANGQI LOGIC ---

const PIECE_VALS: Record<string, number> = {
    'K': 10000, 'A': 20, 'B': 20, 'N': 40, 'R': 90, 'C': 45, 'P': 10,
    'k': 10000, 'a': 20, 'b': 20, 'n': 40, 'r': 90, 'c': 45, 'p': 10
};

// Chinese Notation Converter
const toChineseNotation = (move: {from: number, to: number}, board: string[]) => {
    const p = board[move.from];
    if (!p) return "";
    
    // Coordinates
    // Red: Row 9->0, Col 1(Right)->9(Left)
    // Black: Row 0->9, Col 1(Left)->9(Right)
    const isRed = p === p.toUpperCase();
    
    const r1 = Math.floor(move.from / 9);
    const c1 = move.from % 9;
    const r2 = Math.floor(move.to / 9);
    const c2 = move.to % 9;

    // Source Column (1-9)
    // Red: c=8 is col 1. c=0 is col 9.  => col = 9 - c
    // Black: c=0 is col 1. c=8 is col 9. => col = c + 1
    const srcCol = isRed ? (9 - c1) : (c1 + 1);
    const dstCol = isRed ? (9 - c2) : (c2 + 1);

    const pieceName = {
        'R': '車', 'N': '馬', 'B': '相', 'A': '仕', 'K': '帥', 'C': '炮', 'P': '兵',
        'r': '車', 'n': '馬', 'b': '象', 'a': '士', 'k': '將', 'c': '炮', 'p': '卒'
    }[p] || '';

    const nums = ['','一','二','三','四','五','六','七','八','九']; // Red uses Chinese
    const numsBlk = ['','1','2','3','4','5','6','7','8','9']; // Black uses Arabic in standard notation

    const getColStr = (c: number) => isRed ? nums[c] : numsBlk[c];
    
    // Direction
    // Red: r1 > r2 is Advance (Up), r1 < r2 is Retreat (Down)
    // Black: r1 < r2 is Advance (Down), r1 > r2 is Retreat (Up)
    let dir = '';
    let step = 0;

    if (r1 === r2) {
        dir = '平'; // Traverse
        // For traverse, target is destination column
        return `${pieceName}${getColStr(srcCol)}${dir}${getColStr(dstCol)}`;
    } else {
        const isAdvance = isRed ? (r1 > r2) : (r1 < r2);
        dir = isAdvance ? '进' : '退';
        
        // Step calculation
        // Straight movers (R, C, K, P): Step count (abs row diff)
        // Diagonal movers (N, B, A): Target Column
        const isDiagonal = ['N','B','A','n','b','a'].includes(p);
        
        if (isDiagonal) {
            return `${pieceName}${getColStr(srcCol)}${dir}${getColStr(dstCol)}`;
        } else {
            const rowDiff = Math.abs(r1 - r2);
            // Steps for Red uses Chinese, Black uses Arabic
            const stepStr = isRed ? nums[rowDiff] : numsBlk[rowDiff];
            return `${pieceName}${getColStr(srcCol)}${dir}${stepStr}`;
        }
    }
};

const getMoves = (board: string[], side: 'red' | 'black') => {
    const moves: {from: number, to: number, score: number}[] = [];
    const isOpp = (p: string) => side === 'red' ? (p >= 'a' && p <= 'z') : (p >= 'A' && p <= 'Z');
    const isOwn = (p: string) => side === 'red' ? (p >= 'A' && p <= 'Z') : (p >= 'a' && p <= 'z');
    const isEmpty = (p: string) => p === '';

    for (let i=0; i<90; i++) {
        const p = board[i];
        if (!p || !isOwn(p)) continue;
        const r = Math.floor(i / 9);
        const c = i % 9;
        const type = p.toLowerCase();

        // 1. Rook
        if (type === 'r') {
             [[0,1], [0,-1], [1,0], [-1,0]].forEach(([dr, dc]) => {
                 let nr = r + dr, nc = c + dc;
                 while(nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
                     const ni = nr*9 + nc;
                     const target = board[ni];
                     if (isEmpty(target)) {
                         moves.push({from: i, to: ni, score: 0});
                     } else {
                         if (isOpp(target)) moves.push({from: i, to: ni, score: PIECE_VALS[target] - PIECE_VALS[p]/10});
                         break; 
                     }
                     nr += dr; nc += dc;
                 }
             });
        }
        // 2. Cannon
        else if (type === 'c') {
            [[0,1], [0,-1], [1,0], [-1,0]].forEach(([dr, dc]) => {
                 let nr = r + dr, nc = c + dc;
                 let screen = false;
                 while(nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
                     const ni = nr*9 + nc;
                     const target = board[ni];
                     if (!screen) {
                         if (isEmpty(target)) moves.push({from: i, to: ni, score: 0});
                         else screen = true;
                     } else {
                         if (!isEmpty(target)) {
                             if (isOpp(target)) moves.push({from: i, to: ni, score: PIECE_VALS[target]});
                             break;
                         }
                     }
                     nr += dr; nc += dc;
                 }
             });
        }
        // 3. Knight
        else if (type === 'n') {
            [[1,2], [1,-2], [-1,2], [-1,-2], [2,1], [2,-1], [-2,1], [-2,-1]].forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                const lr = r + (Math.abs(dr)===2 ? Math.sign(dr) : 0);
                const lc = c + (Math.abs(dc)===2 ? Math.sign(dc) : 0);
                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 9 && board[lr*9+lc] === '') {
                     const ni = nr*9 + nc;
                     const target = board[ni];
                     if (isEmpty(target) || isOpp(target)) {
                         moves.push({from: i, to: ni, score: target ? PIECE_VALS[target] : 0});
                     }
                }
            });
        }
        // 4. Pawn
        else if (type === 'p') {
            const dir = side === 'red' ? -1 : 1;
            const crossed = side === 'red' ? r < 5 : r > 4;
            const fr = r + dir;
            if (fr >= 0 && fr < 10) {
                 const ni = fr*9 + c;
                 if (isEmpty(board[ni]) || isOpp(board[ni])) moves.push({from: i, to: ni, score: 0});
            }
            if (crossed) {
                [c-1, c+1].forEach(nc => {
                    if (nc >= 0 && nc < 9) {
                        const ni = r*9 + nc;
                        if (isEmpty(board[ni]) || isOpp(board[ni])) moves.push({from: i, to: ni, score: 0});
                    }
                });
            }
        }
        // 5. King
        else if (type === 'k') {
             [[0,1], [0,-1], [1,0], [-1,0]].forEach(([dr, dc]) => {
                 const nr = r + dr, nc = c + dc;
                 const inPalace = side === 'red' ? (nr>=7 && nr<=9 && nc>=3 && nc<=5) : (nr>=0 && nr<=2 && nc>=3 && nc<=5);
                 if (inPalace) {
                     const ni = nr*9 + nc;
                     if (isEmpty(board[ni]) || isOpp(board[ni])) moves.push({from: i, to: ni, score: 0});
                 }
             });
        }
    }
    return moves.sort((a,b) => b.score - a.score);
};

export const getXiangqiBestMoveLocal = (board: string[]) => {
    // 1-ply search for immediate captures
    const moves = getMoves(board, 'red');
    if (moves.length === 0) return { bestMove: "Resign", futureSteps: [] };
    
    // Pick best score
    const best = moves[0];
    
    return {
        bestMove: toChineseNotation(best, board), // Return format "马三进四"
        reasoning: best.score > 0 ? `Captures value ${best.score}.` : `Positional.`,
        futureSteps: ["..."]
    };
};
