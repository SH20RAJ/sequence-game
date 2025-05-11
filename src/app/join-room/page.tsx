'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinRoom() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !roomCode.trim()) {
      setError('Please enter your name and room code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to join room');
      }
      
      router.push(`/room/${roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-white p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Join a Room</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input w-full"
              placeholder="Enter room code"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
