'use client';

import { GameState, Player } from '@/types/game';

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
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Room: {roomCode}</h2>
          <p className="text-gray-600">
            Status: {gameState ? gameState.status.charAt(0).toUpperCase() + gameState.status.slice(1) : 'Waiting'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="flex flex-wrap gap-4">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`px-3 py-1 rounded-full ${
                  player.id === currentPlayer?.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {player.name} {player.isHost ? '(Host)' : ''}
              </div>
            ))}
          </div>
        </div>
        
        {canStartGame && (
          <button 
            className="btn btn-primary mt-4 md:mt-0"
            onClick={onStartGame}
          >
            Start Game
          </button>
        )}
      </div>
      
      {gameState && gameState.status === 'playing' && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-gray-700">
            Current Turn: {players.find(p => p.id === gameState.currentTurn)?.name || 'Unknown'}
          </p>
          <div className="flex gap-8 mt-2">
            <div>
              <p className="text-blue-500 font-medium">
                {players[0]?.name}: {gameState.player1.sequences.length} sequences
              </p>
            </div>
            <div>
              <p className="text-green-500 font-medium">
                {players[1]?.name}: {gameState.player2.sequences.length} sequences
              </p>
            </div>
          </div>
        </div>
      )}
      
      {gameState && gameState.status === 'completed' && gameState.winner && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xl font-bold text-primary">
            Winner: {players.find(p => p.id === gameState.winner)?.name || 'Unknown'}
          </p>
        </div>
      )}
    </div>
  );
}
