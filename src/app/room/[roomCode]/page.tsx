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

  const handlePlayCard = (card: Card, position?: { row: number; col: number }) => {
    if (!socket || !gameState) return;

    socket.emit('playCard', {
      roomCode,
      card,
      position,
    });
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
    <div className="flex flex-col min-h-screen p-4">
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
                // This will be called when a position is selected on the board
                // We'll handle this in conjunction with the selected card
              }}
            />
          </div>

          <div className="mt-4">
            <PlayerHand
              cards={currentPlayer?.hand || []}
              onPlayCard={handlePlayCard}
              isMyTurn={gameState.currentTurn === currentPlayer?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
