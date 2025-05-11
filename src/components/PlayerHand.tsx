'use client';

import { useState } from 'react';
import { Card } from '@/types/game';
import Image from 'next/image';

interface PlayerHandProps {
  cards: Card[];
  onPlayCard: (card: Card, position?: { row: number; col: number }) => void;
  isMyTurn: boolean;
}

export default function PlayerHand({ cards, onPlayCard, isMyTurn }: PlayerHandProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) return;
    
    setSelectedCard(card);
    
    // If it's a Jack, we can play it directly
    if (card.isJack) {
      onPlayCard(card);
    }
  };

  // Function to get the card image
  const getCardImage = (card: Card) => {
    const { suit, rank } = card;
    return `/images/cards/${rank}_of_${suit}.png`;
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-2">Your Hand</h3>
      
      <div className="flex overflow-x-auto pb-4 gap-2">
        {cards.map((card) => (
          <div 
            key={card.id}
            className={`relative flex-shrink-0 w-20 h-28 border rounded-md overflow-hidden cursor-pointer transition-transform ${
              selectedCard?.id === card.id ? 'transform -translate-y-2 ring-2 ring-primary' : ''
            } ${!isMyTurn ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="relative w-full h-full">
              <Image
                src={getCardImage(card)}
                alt={`${card.rank} of ${card.suit}`}
                fill
                className="object-cover"
              />
            </div>
            
            {card.isJack && (
              <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
                {card.jackType === 'one-eyed' ? 'Remove Chip' : 'Wild Card'}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {!isMyTurn && (
        <p className="text-gray-500 text-sm">Waiting for your turn...</p>
      )}
    </div>
  );
}
