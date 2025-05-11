import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-white p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-primary">Sequence</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          A beautiful online multiplayer card game for you and your loved one.
        </p>
      </div>
      
      <div className="card w-full max-w-md p-8 mb-8">
        <div className="flex flex-col gap-4">
          <Link 
            href="/create-room" 
            className="btn btn-primary text-center"
          >
            Create a Room
          </Link>
          <Link 
            href="/join-room" 
            className="btn btn-secondary text-center"
          >
            Join a Room
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">How to Play</h2>
        <p className="text-gray-600 max-w-2xl">
          Sequence is a board game that combines elements of card games and strategy. 
          The goal is to form rows of five chips on the game board by playing cards from your hand.
        </p>
      </div>
    </div>
  );
}
