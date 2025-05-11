import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background bg-hearts-pattern p-4">
      <div className="text-center mb-8 animate-float">
        <h1 className="text-6xl font-bold mb-4 love-title">Love Sequence</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          A beautiful card game for you and your special someone
          <span className="heart-icon ml-2">❤️</span>
        </p>
      </div>

      <div className="card w-full max-w-md p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10">
          <span className="text-9xl text-primary">❤️</span>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Play Together</h2>

        <div className="flex flex-col gap-4 relative z-10">
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

      <div className="card mt-4 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-primary">How to Play</h2>
        <p className="text-gray-600">
          Sequence is a romantic strategy game for two players. Take turns playing cards from your hand
          to place chips on the board. Form a sequence of 5 chips in a row to win your partner's heart!
        </p>

        <div className="mt-4 flex justify-center gap-4">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-player1 mx-auto"></div>
            <p className="text-sm mt-1">You</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-player2 mx-auto"></div>
            <p className="text-sm mt-1">Your Love</p>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        Made with love for you two ❤️
      </footer>
    </div>
  );
}
