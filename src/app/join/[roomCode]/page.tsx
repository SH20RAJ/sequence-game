'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { showNotification } from '@/components/Notification';

export default function DirectJoinPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    if (roomCode) {
      showNotification(`You're joining room: ${roomCode}`, 'info');
    }
  }, [roomCode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
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
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to join room');
      }
      
      // Redirect to the room
      router.push(`/room/${roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background bg-hearts-pattern p-4">
      <div className="card w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10">
          <span className="text-9xl text-primary">❤️</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-6 text-center love-title">Join Your Love</h1>
        
        <div className="mb-6 text-center">
          <div className="inline-block bg-pink-50 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-600">You're joining room:</p>
            <p className="text-xl font-bold text-primary">{roomCode}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
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
              autoFocus
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              <>Join Room <span className="ml-1">❤️</span></>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:underline flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
