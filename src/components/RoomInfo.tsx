'use client';

import { GameState, Player } from '@/types/game';
import { useState, useEffect } from 'react';

interface RoomInfoProps {
  roomCode: string;
  players: Player[];
  gameState: GameState | null;
  currentPlayer: Player | null;
  onStartGame: () => void;
}

export default function RoomInfo({
  roomCode,
  players,
  gameState,
  currentPlayer,
  onStartGame
}: RoomInfoProps) {
  const isHost = currentPlayer?.isHost;
  const canStartGame = isHost && players.length === 2 && (!gameState || gameState.status === 'waiting');
  const [copied, setCopied] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
  };

  return (
    <div className="card mb-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
        <span className="text-9xl text-primary">❤️</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
        <div>
          <div className="flex items-center">
            <h2 className="text-2xl font-bold love-title">Love Room</h2>
            <div
              className="ml-3 px-3 py-1 bg-pink-50 rounded-full text-primary font-medium flex items-center cursor-pointer"
              onClick={copyRoomCode}
              title="Click to copy"
            >
              {roomCode}
              <span className="ml-2">
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            Status: <span className="font-medium">{gameState ? gameState.status.charAt(0).toUpperCase() + gameState.status.slice(1) : 'Waiting for your partner'}</span>
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="flex flex-wrap gap-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`px-4 py-2 rounded-full shadow-sm flex items-center ${
                  index === 0
                    ? 'bg-player1 text-white'
                    : 'bg-player2 text-white'
                }`}
              >
                <span className="mr-2">{index === 0 ? '❤️' : '💙'}</span>
                {player.name} {player.isHost ? '(Host)' : ''}
                {player.id === currentPlayer?.id && (
                  <span className="ml-1 text-xs bg-white bg-opacity-20 px-1 rounded">You</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {canStartGame && (
          <button
            className="btn btn-primary mt-4 md:mt-0 animate-pulse-love"
            onClick={onStartGame}
          >
            Start Game ❤️
          </button>
        )}
      </div>

      {gameState && gameState.status === 'playing' && (
        <div className="mt-6 pt-4 border-t border-pink-100">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-700 font-medium mb-2 sm:mb-0">
              Current Turn:
              <span className={`ml-2 px-2 py-1 rounded-full text-white ${
                gameState.currentTurn === players[0]?.id ? 'bg-player1' : 'bg-player2'
              }`}>
                {players.find(p => p.id === gameState.currentTurn)?.name || 'Unknown'}
                {gameState.currentTurn === currentPlayer?.id && ' (You)'}
              </span>
            </p>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-player1 mx-auto flex items-center justify-center text-white font-bold">
                  {gameState.player1.sequences.length}
                </div>
                <p className="text-xs mt-1">{players[0]?.name}</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-player2 mx-auto flex items-center justify-center text-white font-bold">
                  {gameState.player2.sequences.length}
                </div>
                <p className="text-xs mt-1">{players[1]?.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState && gameState.status === 'completed' && gameState.winner && (
        <div className="mt-6 pt-4 border-t border-pink-100">
          <div className="text-center">
            <p className="text-2xl font-bold love-title">
              {gameState.winner === currentPlayer?.id ? 'You Won!' : `${players.find(p => p.id === gameState.winner)?.name} Won!`}
            </p>
            <div className="mt-2 animate-float">
              {gameState.winner === players[0]?.id ? '❤️' : '💙'}
            </div>
            <button
              className="btn btn-primary mt-4"
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
