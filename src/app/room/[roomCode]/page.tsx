'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import PlayerHand from '@/components/PlayerHand';
import RoomInfo from '@/components/RoomInfo';
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
    // Initialize socket connection
    const newSocket = io({
      path: '/api/socket',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
      // Join the room
      newSocket.emit('joinRoom', { roomCode });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to game server. Please try again.');
    });

    newSocket.on('roomData', (data) => {
      setPlayers(data.players);
      setGameState(data.gameState);
      setCurrentPlayer(data.currentPlayer);
      setIsLoading(false);
    });

    newSocket.on('gameStateUpdate', (data) => {
      setGameState(data.gameState);
      setCurrentPlayer(data.currentPlayer);
    });

    newSocket.on('error', (data) => {
      setError(data.message);
      setIsLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode]);

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
      setSelectedCard(null);
    }
  };

  const handleStartGame = () => {
    if (!socket) return;

    socket.emit('startGame', { roomCode });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
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
          <div className="card p-8 text-center max-w-md animate-float">
            <h2 className="text-2xl font-bold love-title mb-4">Waiting for Your Partner</h2>
            <p className="text-gray-600 mb-6">
              Share this room code with your partner so they can join and play with you:
            </p>

            <div className="bg-pink-50 p-4 rounded-lg mb-6">
              <p className="text-3xl font-bold text-primary tracking-widest">{roomCode}</p>
            </div>

            <div className="flex justify-center">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(roomCode);
                  alert('Room code copied to clipboard!');
                }}
              >
                Copy Room Code
              </button>
            </div>

            <div className="mt-8 text-gray-500 flex items-center justify-center">
              <span className="animate-pulse-love mr-2">❤️</span>
              <span>Once your partner joins, you can start the game</span>
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
