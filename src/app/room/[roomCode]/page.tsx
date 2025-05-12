'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import PlayerHand from '@/components/PlayerHand';
import RoomInfo from '@/components/RoomInfo';
import LoadingScreen from '@/components/LoadingScreen';
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
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Connection timed out. Please refresh the page and try again.');
      }
    }, 15000); // 15 seconds timeout

    // Initialize socket connection with better configuration
    const newSocket = io({
      path: '/api/socket',
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      timeout: 20000,
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
      setPlayers(data.players);
      setGameState(data.gameState);
      setCurrentPlayer(data.currentPlayer);
      setIsLoading(false);

      // Show notification when player joins
      if (data.players.length > 1) {
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

      // Clear the loading timeout
      clearTimeout(loadingTimeout);
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

  // Show loading screen while connecting (but only for a very short time)
  if (isLoading && !roomCode) {
    return <LoadingScreen message={error || "Connecting to your love game..."} />;
  }

  // Show error screen if there's an error but we're not loading
  if (error) {
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
          <div className="card p-8 text-center max-w-md animate-float relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-10">
              <span className="text-9xl text-primary">❤️</span>
            </div>

            <h2 className="text-2xl font-bold love-title mb-4">Waiting for Your Partner</h2>
            <p className="text-gray-600 mb-6">
              Share this room code with your partner so they can join and play with you:
            </p>

            <div className="bg-pink-50 p-4 rounded-lg mb-6 relative">
              <p className="text-3xl font-bold text-primary tracking-widest">{roomCode}</p>
              <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-md">
                <span className="animate-pulse-love">❤️</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(roomCode);
                  showNotification('Room code copied to clipboard!', 'success');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Code
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  // Create shareable link
                  const shareUrl = window.location.href;
                  const shareText = `Join me for a game of Love Sequence! Room code: ${roomCode}`;

                  // Use Web Share API if available
                  if (navigator.share) {
                    navigator.share({
                      title: 'Love Sequence Game',
                      text: shareText,
                      url: shareUrl,
                    }).catch(err => {
                      console.error('Error sharing:', err);
                      // Fallback to copying the link
                      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                      showNotification('Share info copied to clipboard!', 'success');
                    });
                  } else {
                    // Fallback to copying the link
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    showNotification('Share info copied to clipboard!', 'success');
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Link
              </button>
            </div>

            <div className="mt-8 text-gray-500 flex items-center justify-center">
              <span className="animate-pulse-love mr-2">❤️</span>
              <span>Once your partner joins, you can start the game</span>
            </div>

            <div className="mt-6 pt-4 border-t border-pink-100">
              <p className="text-sm text-gray-500">
                Players: {players.length}/2
                {players.map((player) => (
                  <span key={player.id} className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                    {player.name} {player.isHost ? '(Host)' : ''}
                  </span>
                ))}
              </p>
            </div>
          </div>
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
