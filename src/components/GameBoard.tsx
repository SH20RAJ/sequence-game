'use client';

import { useState, useEffect } from 'react';
import { BoardCell } from '@/types/game';
import Image from 'next/image';

interface GameBoardProps {
  board: BoardCell[][];
  onSelectPosition: (position: { row: number; col: number }) => void;
}

export default function GameBoard({ board, onSelectPosition }: GameBoardProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ row: number; col: number } | null>(null);
  const [lastPlacedPosition, setLastPlacedPosition] = useState<{ row: number; col: number } | null>(null);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Adjust board size based on window size
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 40, 600);
      const height = (width * 1.1);
      setBoardSize({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    setSelectedPosition({ row, col });
    onSelectPosition({ row, col });
  };

  // Function to get the color for a chip
  const getChipColor = (chip: 'player1' | 'player2' | undefined) => {
    if (chip === 'player1') return 'player1-chip';
    if (chip === 'player2') return 'player2-chip';
    return '';
  };

  // Function to get the card image
  const getCardImage = (cell: BoardCell) => {
    if (cell.isCorner) {
      return '/images/free-space.png';
    }

    if (!cell.card) {
      return '/images/card-back.png';
    }

    const { suit, rank } = cell.card;
    return `/images/cards/${rank}_of_${suit}.png`;
  };

  return (
    <div className="w-full overflow-auto py-4 game-board">
      <div
        className="grid grid-cols-10 gap-1 mx-auto"
        style={{
          width: boardSize.width,
          height: boardSize.height
        }}
      >
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const isSelected = selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex;
            const isLastPlaced = lastPlacedPosition?.row === rowIndex && lastPlacedPosition?.col === colIndex;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`relative aspect-[3/4] border border-pink-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary transform scale-105 z-10' : ''
                } ${isLastPlaced ? 'animate-pulse-love' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {/* Card image */}
                <div className="absolute inset-0">
                  <div className="relative w-full h-full">
                    <Image
                      src={getCardImage(cell)}
                      alt={cell.card ? `${cell.card.rank} of ${cell.card.suit}` : 'Card'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 30vw, 60px"
                    />
                  </div>
                </div>

                {/* Chip overlay */}
                {cell.chip && (
                  <div className={`absolute inset-0 flex items-center justify-center`}>
                    <div className={`w-3/4 h-3/4 rounded-full ${getChipColor(cell.chip)} shadow-md opacity-80 flex items-center justify-center`}>
                      {cell.chip === 'player1' ? (
                        <span className="text-white text-xs">❤️</span>
                      ) : (
                        <span className="text-white text-xs">💙</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Corner indicator */}
                {cell.isCorner && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-primary text-lg font-bold">FREE</div>
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}
