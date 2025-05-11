export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type JackType = 'one-eyed' | 'two-eyed';

export interface Card {
  suit: CardSuit;
  rank: CardRank;
  isJack?: boolean;
  jackType?: JackType;
  id: string; // Unique identifier for the card
}

export interface BoardCell {
  card?: Card;
  chip?: 'player1' | 'player2';
  isCorner?: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isHost: boolean;
}

export interface Sequence {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  player: 'player1' | 'player2';
}

export interface GameState {
  status: 'waiting' | 'playing' | 'completed';
  board: BoardCell[][];
  currentTurn: string; // Player ID
  player1: {
    id: string;
    sequences: Sequence[];
  };
  player2: {
    id: string;
    sequences: Sequence[];
  };
  winner?: string; // Player ID
}

export interface RoomData {
  roomCode: string;
  players: Player[];
  gameState: GameState | null;
}
