'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { showNotification } from './Notification';
import QRCode from 'qrcode.react';

interface WaitingRoomProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function WaitingRoom({ roomCode, players, isHost, onStartGame }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Create join URL - use direct join link
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setJoinUrl(`${baseUrl}/join/${roomCode}`);

    // Update connection status based on players
    if (players.length > 0) {
      setConnectionStatus('connected');
    }

    // Auto-start game when second player joins if you're the host
    if (isHost && players.length === 2) {
      const timer = setTimeout(() => {
        showNotification('Starting game automatically...', 'info');
        onStartGame();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [roomCode, players.length, isHost, onStartGame]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    showNotification('Room code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    showNotification('Join link copied to clipboard!', 'success');
  };

  const shareLink = () => {
    const shareText = `Join me for a game of Love Sequence! Room code: ${roomCode}`;

    if (navigator.share) {
      navigator.share({
        title: 'Love Sequence Game',
        text: shareText,
        url: joinUrl,
      }).catch(err => {
        console.error('Error sharing:', err);
        copyJoinLink();
      });
    } else {
      copyJoinLink();
    }
  };

  return (
    <div className="card p-8 text-center max-w-md animate-float relative overflow-hidden">
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
        <span className="text-9xl text-primary">❤️</span>
      </div>

      <h2 className="text-2xl font-bold love-title mb-4">Waiting for Your Partner</h2>

      <div className="flex items-center justify-center mb-6">
        <div className={`w-3 h-3 rounded-full animate-pulse mr-2 ${
          connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`}></div>
        <p className="text-gray-600">
          {connectionStatus === 'connecting' && "Connecting to game server..."}
          {connectionStatus === 'error' && "Connection issues. Game will start when connected."}
          {connectionStatus === 'connected' && players.length === 0 && "Connected! Waiting for player data..."}
          {connectionStatus === 'connected' && players.length === 1 && "Waiting for your partner to join..."}
          {connectionStatus === 'connected' && players.length === 2 && "Your partner has joined! Starting game soon..."}
        </p>
      </div>

      <div className="bg-pink-50 p-4 rounded-lg mb-6 relative">
        <p className="text-3xl font-bold text-primary tracking-widest">{roomCode}</p>
        <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-md">
          <span className="animate-pulse-love">❤️</span>
        </div>
      </div>

      {showQR && (
        <div className="mb-6 p-4 bg-white rounded-lg inline-block mx-auto">
          <QRCode value={joinUrl} size={150} />
          <p className="mt-2 text-sm text-gray-500">Scan to join</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <button
          className="btn btn-secondary"
          onClick={copyRoomCode}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {copied ? 'Copied!' : 'Copy Code'}
        </button>

        <button
          className="btn btn-primary"
          onClick={shareLink}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Link
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setShowQR(!showQR)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0v5m0-5h2m6-6h2M4 12H2m10-3h2M4 9h2m6-6h2M4 6h2m6 12h2m-6 0H6" />
          </svg>
          {showQR ? 'Hide QR' : 'Show QR'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-pink-100">
        <p className="text-sm text-gray-500 mb-2">
          Players: {players.length}/2
        </p>
        <div className="flex justify-center gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`px-3 py-1 rounded-full text-white text-sm ${
                player.isHost ? 'bg-player1' : 'bg-player2'
              }`}
            >
              {player.name} {player.isHost ? '(Host)' : ''}
            </div>
          ))}
        </div>
      </div>

      {isHost && players.length === 2 && (
        <div className="mt-6">
          <button
            className="btn btn-primary animate-pulse-love"
            onClick={onStartGame}
          >
            Start Game Now
          </button>
        </div>
      )}
    </div>
  );
}
