'use client';

import { useState } from 'react';
import { BoardCell } from '@/types/game';
import Image from 'next/image';

interface GameBoardProps {
  board: BoardCell[][];
  onSelectPosition: (position: { row: number; col: number }) => void;
}

export default function GameBoard({ board, onSelectPosition }: GameBoardProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ row: number; col: number } | null>(null);

  const handleCellClick = (row: number, col: number) => {
    setSelectedPosition({ row, col });
    onSelectPosition({ row, col });
  };

  // Function to get the color for a chip
  const getChipColor = (chip: 'player1' | 'player2' | undefined) => {
    if (chip === 'player1') return 'bg-blue-500';
    if (chip === 'player2') return 'bg-green-500';
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
    <div className="w-full overflow-auto">
      <div className="grid grid-cols-10 gap-1 max-w-4xl mx-auto">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`relative aspect-[3/4] border rounded-md overflow-hidden cursor-pointer ${
                selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
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
                  />
                </div>
              </div>
              
              {/* Chip overlay */}
              {cell.chip && (
                <div className={`absolute inset-0 flex items-center justify-center`}>
                  <div className={`w-3/4 h-3/4 rounded-full ${getChipColor(cell.chip)} opacity-70`}></div>
                </div>
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}
