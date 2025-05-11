import { v4 as uuidv4 } from 'uuid';
import { Card, CardRank, CardSuit, BoardCell } from '@/types/game';

// Generate a random 6-character room code
export function generateRoomCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Create a deck of cards
export function createDeck(): Card[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  
  // Create two decks (104 cards)
  for (let i = 0; i < 2; i++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        const card: Card = {
          suit,
          rank,
          id: uuidv4(),
        };
        
        // Mark Jacks
        if (rank === 'J') {
          card.isJack = true;
          
          // One-eyed Jacks: Jack of Hearts and Jack of Spades
          if (suit === 'hearts' || suit === 'spades') {
            card.jackType = 'one-eyed';
          } 
          // Two-eyed Jacks: Jack of Diamonds and Jack of Clubs
          else {
            card.jackType = 'two-eyed';
          }
        }
        
        deck.push(card);
      }
    }
  }
  
  return deck;
}

// Shuffle a deck of cards
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal cards to players
export function dealCards(deck: Card[], numPlayers: number): { hands: Card[][], remainingDeck: Card[] } {
  const hands: Card[][] = [];
  const cardsPerPlayer = 7; // For a 2-player game
  
  for (let i = 0; i < numPlayers; i++) {
    hands.push([]);
  }
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < numPlayers; j++) {
      if (deck.length > 0) {
        const card = deck.pop()!;
        hands[j].push(card);
      }
    }
  }
  
  return { hands, remainingDeck: deck };
}

// Create the initial game board
export function createGameBoard(): BoardCell[][] {
  const board: BoardCell[][] = [];
  const size = 10; // 10x10 board
  
  for (let i = 0; i < size; i++) {
    board.push([]);
    for (let j = 0; j < size; j++) {
      const cell: BoardCell = {};
      
      // Mark corner cells as free spaces
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === size - 1) ||
        (i === size - 1 && j === 0) ||
        (i === size - 1 && j === size - 1)
      ) {
        cell.isCorner = true;
      }
      
      board[i].push(cell);
    }
  }
  
  return board;
}

// Check if a sequence is formed
export function checkForSequence(
  board: BoardCell[][],
  row: number,
  col: number,
  player: 'player1' | 'player2'
): { hasSequence: boolean; sequence?: { startRow: number; startCol: number; endRow: number; endCol: number } } {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];
  
  for (const [dx, dy] of directions) {
    let count = 1;
    let startRow = row;
    let startCol = col;
    let endRow = row;
    let endCol = col;
    
    // Check in positive direction
    for (let i = 1; i < 5; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      
      if (
        newRow < 0 || newRow >= board.length ||
        newCol < 0 || newCol >= board[0].length ||
        board[newRow][newCol].chip !== player
      ) {
        break;
      }
      
      count++;
      endRow = newRow;
      endCol = newCol;
    }
    
    // Check in negative direction
    for (let i = 1; i < 5; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      
      if (
        newRow < 0 || newRow >= board.length ||
        newCol < 0 || newCol >= board[0].length ||
        board[newRow][newCol].chip !== player
      ) {
        break;
      }
      
      count++;
      startRow = newRow;
      startCol = newCol;
    }
    
    if (count >= 5) {
      return {
        hasSequence: true,
        sequence: {
          startRow,
          startCol,
          endRow,
          endCol,
        },
      };
    }
  }
  
  return { hasSequence: false };
}
