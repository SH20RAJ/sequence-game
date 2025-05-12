'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import PlayerHand from '@/components/PlayerHand';
import RoomInfo from '@/components/RoomInfo';
import LoadingScreen from '@/components/LoadingScreen';
import WaitingRoom from '@/components/WaitingRoom';
import { showNotification } from '@/components/Notification';
import { io, Socket } from 'socket.io-client';
import { Card, GameState, Player } from '@/types/game';

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set a shorter timeout to show the waiting room even if socket connection is slow
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, showing waiting room');
        // Just set loading to false without error to show the waiting room
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout

    // Set a longer timeout for actual connection error
    const errorTimeout = setTimeout(() => {
      if (!socket || !socket.connected) {
        console.log('Connection timeout reached, showing error');
        setError('Connection timed out. Please refresh the page and try again.');
      }
    }, 15000); // 15 seconds timeout

    // Initialize socket connection with optimized configuration
    const newSocket = io({
      path: '/api/socket',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Try polling first as it's more reliable for initial connection
      transports: ['polling', 'websocket'],
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
    });

    // Debug all socket events
    const originalEmit = newSocket.emit;
    newSocket.emit = function(event, ...args) {
      console.log(`Emitting event: ${event}`, args);
      return originalEmit.apply(this, [event, ...args]);
    };

    newSocket.on('connect', () => {
      console.log('Socket connected successfully with ID:', newSocket.id);
      setError(''); // Clear any previous errors

      // Join the room
      newSocket.emit('joinRoom', { roomCode });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Connection error: ${err.message}. Please refresh the page.`);
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(`Game error: ${typeof err === 'string' ? err : 'Unknown error'}`);
    });

    newSocket.io.on('reconnect', (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
      // Re-join the room after reconnection
      newSocket.emit('joinRoom', { roomCode });
    });

    newSocket.io.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnection attempt ${attempt}`);
    });

    newSocket.io.on('reconnect_error', (err) => {
      console.error('Socket reconnection error:', err);
    });

    newSocket.io.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setError('Failed to reconnect to the game. Please refresh the page.');
    });

    newSocket.on('roomData', (data) => {
      console.log('Received roomData:', data);
      setPlayers(data.players || []);
      setGameState(data.gameState);
      setCurrentPlayer(data.currentPlayer);

      // Important: Set loading to false to show the waiting room
      setIsLoading(false);

      // Show notification when player joins
      if (data.players && data.players.length > 1) {
        showNotification(`${data.players[data.players.length - 1].name} has joined the game!`, 'info');
      }
    });

    newSocket.on('gameStateUpdate', (data) => {
      setGameState(data.gameState);
      setCurrentPlayer(data.currentPlayer);

      // Show notification for turn changes
      if (data.gameState.currentTurn === data.currentPlayer?.id) {
        showNotification('It\'s your turn! ❤️', 'success');
      }

      // Show notification for sequences
      if (data.gameState.player1.sequences.length > (gameState?.player1.sequences.length || 0) ||
          data.gameState.player2.sequences.length > (gameState?.player2.sequences.length || 0)) {
        showNotification('A sequence has been completed! 🎉', 'success');
      }
    });

    newSocket.on('error', (data) => {
      setError(data.message);
      setIsLoading(false);
      showNotification(data.message, 'error');
    });

    setSocket(newSocket);

    return () => {
      // Clean up socket connection
      newSocket.disconnect();

      // Clear all timeouts
      clearTimeout(loadingTimeout);
      clearTimeout(errorTimeout);
    };
  }, [roomCode, isLoading]);

  // State to track the selected card
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handlePlayCard = (card: Card | null, position?: { row: number; col: number }) => {
    if (!socket || !gameState) return;

    // If a card is provided, store it as the selected card
    if (card) {
      setSelectedCard(card);

      // If it's a Jack, we need to wait for position selection
      if (!card.isJack) {
        // For regular cards, we need both card and position
        if (position) {
          socket.emit('playCard', {
            roomCode,
            card,
            position,
          });
          setSelectedCard(null);
          showNotification(`Played ${card.rank} of ${card.suit}`, 'success');
        }
      }
      return;
    }

    // If no card is provided but we have a position and a previously selected card
    if (position && selectedCard) {
      socket.emit('playCard', {
        roomCode,
        card: selectedCard,
        position,
      });
      showNotification(`Played ${selectedCard.rank} of ${selectedCard.suit}`, 'success');
      setSelectedCard(null);
    }
  };

  const handleStartGame = () => {
    if (!socket) return;

    socket.emit('startGame', { roomCode });
    showNotification('Starting the game! ❤️', 'success');
  };

  // Show loading screen while connecting (but only for a short time)
  if (isLoading) {
    return <LoadingScreen message={error || "Connecting to your love game..."} />;
  }

  // Show error screen if there's an error but we're not loading
  if (error && !players.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background bg-hearts-pattern">
        <div className="card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If we have a room code but no socket connection yet, show the waiting room anyway
  // This ensures users can see and share the room code even if socket connection is slow
  if (!socket && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen p-4 bg-background bg-hearts-pattern">
        <div className="flex-grow flex flex-col items-center justify-center">
          <WaitingRoom
            roomCode={roomCode}
            players={[]}
            isHost={true}
            onStartGame={() => {
              showNotification('Connecting to game server...', 'info');
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-background bg-hearts-pattern">
      <RoomInfo
        roomCode={roomCode}
        players={players}
        gameState={gameState}
        currentPlayer={currentPlayer}
        onStartGame={handleStartGame}
      />

      {gameState && gameState.status === 'playing' && (
        <div className="flex flex-col flex-grow">
          <div className="flex-grow">
            <GameBoard
              board={gameState.board}
              onSelectPosition={(position) => {
                if (gameState.currentTurn === currentPlayer?.id) {
                  // Handle position selection
                  handlePlayCard(null, position);
                }
              }}
            />
          </div>

          <div>
            <PlayerHand
              cards={currentPlayer?.hand || []}
              onPlayCard={handlePlayCard}
              isMyTurn={gameState.currentTurn === currentPlayer?.id}
            />
          </div>
        </div>
      )}

      {(!gameState || gameState.status === 'waiting') && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <WaitingRoom
            roomCode={roomCode}
            players={players}
            isHost={currentPlayer?.isHost || false}
            onStartGame={handleStartGame}
          />
        </div>
      )}

      {gameState && gameState.status === 'completed' && (
        <div className="flex-grow flex items-center justify-center">
          <div className="card p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold love-title mb-4">
              {gameState.winner === currentPlayer?.id ? 'You Won!' : `${players.find(p => p.id === gameState.winner)?.name} Won!`}
            </h2>

            <div className="text-6xl my-6 animate-float">
              {gameState.winner === players[0]?.id ? '❤️' : '💙'}
            </div>

            <p className="text-gray-600 mb-6">
              Thank you for playing Love Sequence together!
            </p>

            <button
              className="btn btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
