import { NextRequest } from 'next/server';
import { Server } from 'socket.io';
import prisma from '@/lib/prisma';
import { createDeck, shuffleDeck, dealCards, createGameBoard, checkForSequence } from '@/utils/game';
import { Card, GameState } from '@/types/game';

// Store active games in memory
const activeGames = new Map();

// Socket.io server
const io = new Server({
  path: '/api/socket',
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join a room
  socket.on('joinRoom', async ({ roomCode }) => {
    try {
      socket.join(roomCode);
      
      // Get game data from database
      const game = await prisma.game.findUnique({
        where: { roomCode },
        include: {
          host: true,
          playerToGame: {
            include: {
              player: true,
            },
          },
          gameState: true,
        },
      });
      
      if (!game) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Format players data
      const players = game.playerToGame.map((ptg) => ({
        id: ptg.player.id,
        name: ptg.player.name,
        isHost: ptg.player.id === game.hostId,
        hand: [], // Will be populated if game is in progress
      }));
      
      // Get or initialize game state
      let gameState = null;
      
      if (game.gameState) {
        gameState = {
          status: game.status as 'waiting' | 'playing' | 'completed',
          board: game.gameState.board as any,
          currentTurn: game.gameState.currentTurn,
          player1: {
            id: players[0]?.id,
            sequences: (game.gameState.sequences as any).filter((s: any) => s.player === 'player1'),
          },
          player2: {
            id: players[1]?.id,
            sequences: (game.gameState.sequences as any).filter((s: any) => s.player === 'player2'),
          },
          winner: game.gameState.winner,
        };
        
        // If game is in progress, get player hands
        if (game.status === 'playing') {
          const player1Hand = game.gameState.player1Hand as any;
          const player2Hand = game.gameState.player2Hand as any;
          
          // Find the current player
          const currentPlayerIndex = players.findIndex((p) => p.id === socket.id);
          
          if (currentPlayerIndex === 0) {
            players[0].hand = player1Hand;
          } else if (currentPlayerIndex === 1) {
            players[1].hand = player2Hand;
          }
        }
      }
      
      // Send room data to the client
      socket.emit('roomData', {
        players,
        gameState,
        currentPlayer: players.find((p) => p.id === socket.id),
      });
      
      // Notify other clients in the room
      socket.to(roomCode).emit('playerJoined', {
        players,
      });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Start the game
  socket.on('startGame', async ({ roomCode }) => {
    try {
      // Get game data from database
      const game = await prisma.game.findUnique({
        where: { roomCode },
        include: {
          playerToGame: {
            include: {
              player: true,
            },
          },
        },
      });
      
      if (!game) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      if (game.hostId !== socket.id) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }
      
      if (game.playerToGame.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }
      
      if (game.status !== 'waiting') {
        socket.emit('error', { message: 'Game has already started' });
        return;
      }
      
      // Initialize the game
      const deck = createDeck();
      const shuffledDeck = shuffleDeck(deck);
      const { hands, remainingDeck } = dealCards(shuffledDeck, 2);
      const board = createGameBoard();
      
      // Create game state
      const gameState: GameState = {
        status: 'playing',
        board,
        currentTurn: game.playerToGame[0].playerId, // First player starts
        player1: {
          id: game.playerToGame[0].playerId,
          sequences: [],
        },
        player2: {
          id: game.playerToGame[1].playerId,
          sequences: [],
        },
      };
      
      // Save game state to database
      await prisma.gameState.create({
        data: {
          gameId: game.id,
          currentTurn: gameState.currentTurn,
          board: gameState.board as any,
          deck: remainingDeck as any,
          player1Hand: hands[0] as any,
          player2Hand: hands[1] as any,
          sequences: [] as any,
        },
      });
      
      // Update game status
      await prisma.game.update({
        where: { id: game.id },
        data: { status: 'playing' },
      });
      
      // Store game state in memory
      activeGames.set(roomCode, {
        gameState,
        deck: remainingDeck,
        hands,
      });
      
      // Send game state to all clients in the room
      io.to(roomCode).emit('gameStarted', {
        gameState,
        players: game.playerToGame.map((ptg, index) => ({
          id: ptg.player.id,
          name: ptg.player.name,
          isHost: ptg.player.id === game.hostId,
          hand: hands[index],
        })),
      });
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });
  
  // Play a card
  socket.on('playCard', async ({ roomCode, card, position }) => {
    try {
      // Get active game from memory
      const activeGame = activeGames.get(roomCode);
      
      if (!activeGame) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      const { gameState, deck, hands } = activeGame;
      
      if (gameState.status !== 'playing') {
        socket.emit('error', { message: 'Game is not in progress' });
        return;
      }
      
      if (gameState.currentTurn !== socket.id) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      // Determine player index (0 or 1)
      const playerIndex = gameState.player1.id === socket.id ? 0 : 1;
      const playerKey = playerIndex === 0 ? 'player1' : 'player2';
      const opponentKey = playerIndex === 0 ? 'player2' : 'player1';
      
      // Check if player has the card
      const handIndex = hands[playerIndex].findIndex((c) => c.id === card.id);
      
      if (handIndex === -1) {
        socket.emit('error', { message: 'Card not in hand' });
        return;
      }
      
      // Handle card play based on type
      if (card.isJack) {
        if (card.jackType === 'one-eyed') {
          // One-eyed Jack: Remove opponent's chip
          if (!position) {
            socket.emit('error', { message: 'Position required for one-eyed Jack' });
            return;
          }
          
          const { row, col } = position;
          const cell = gameState.board[row][col];
          
          if (!cell.chip || cell.chip === playerKey) {
            socket.emit('error', { message: 'Can only remove opponent\'s chips' });
            return;
          }
          
          // Remove the chip
          gameState.board[row][col].chip = undefined;
        } else {
          // Two-eyed Jack: Place chip anywhere
          if (!position) {
            socket.emit('error', { message: 'Position required for two-eyed Jack' });
            return;
          }
          
          const { row, col } = position;
          const cell = gameState.board[row][col];
          
          if (cell.chip) {
            socket.emit('error', { message: 'Space already occupied' });
            return;
          }
          
          // Place the chip
          gameState.board[row][col].chip = playerKey;
          
          // Check for sequence
          const sequenceResult = checkForSequence(gameState.board, row, col, playerKey);
          
          if (sequenceResult.hasSequence && sequenceResult.sequence) {
            gameState[playerKey].sequences.push({
              ...sequenceResult.sequence,
              player: playerKey,
            });
            
            // Check for win (2 sequences)
            if (gameState[playerKey].sequences.length >= 2) {
              gameState.status = 'completed';
              gameState.winner = socket.id;
            }
          }
        }
      } else {
        // Regular card: Place chip on matching card
        if (!position) {
          socket.emit('error', { message: 'Position required' });
          return;
        }
        
        const { row, col } = position;
        const cell = gameState.board[row][col];
        
        if (cell.chip) {
          socket.emit('error', { message: 'Space already occupied' });
          return;
        }
        
        if (!cell.card || cell.card.rank !== card.rank || cell.card.suit !== card.suit) {
          socket.emit('error', { message: 'Card does not match board position' });
          return;
        }
        
        // Place the chip
        gameState.board[row][col].chip = playerKey;
        
        // Check for sequence
        const sequenceResult = checkForSequence(gameState.board, row, col, playerKey);
        
        if (sequenceResult.hasSequence && sequenceResult.sequence) {
          gameState[playerKey].sequences.push({
            ...sequenceResult.sequence,
            player: playerKey,
          });
          
          // Check for win (2 sequences)
          if (gameState[playerKey].sequences.length >= 2) {
            gameState.status = 'completed';
            gameState.winner = socket.id;
          }
        }
      }
      
      // Remove card from hand and draw a new one
      hands[playerIndex].splice(handIndex, 1);
      
      if (deck.length > 0) {
        const newCard = deck.pop()!;
        hands[playerIndex].push(newCard);
      }
      
      // Switch turns
      gameState.currentTurn = gameState[opponentKey].id;
      
      // Update game state in memory
      activeGames.set(roomCode, {
        gameState,
        deck,
        hands,
      });
      
      // Send updated game state to all clients in the room
      io.to(roomCode).emit('gameStateUpdate', {
        gameState,
        players: [
          {
            id: gameState.player1.id,
            hand: hands[0],
          },
          {
            id: gameState.player2.id,
            hand: hands[1],
          },
        ],
      });
      
      // If game is completed, update database
      if (gameState.status === 'completed') {
        await prisma.game.update({
          where: { roomCode },
          data: { status: 'completed' },
        });
        
        await prisma.gameState.update({
          where: { gameId: (await prisma.game.findUnique({ where: { roomCode } }))!.id },
          data: {
            winner: gameState.winner,
            sequences: gameState.player1.sequences.concat(gameState.player2.sequences) as any,
          },
        });
      }
    } catch (error) {
      console.error('Error playing card:', error);
      socket.emit('error', { message: 'Failed to play card' });
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export async function GET(req: NextRequest) {
  return new Response('Socket.io server');
}
