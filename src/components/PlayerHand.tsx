'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/game';
import Image from 'next/image';

interface PlayerHandProps {
  cards: Card[];
  onPlayCard: (card: Card, position?: { row: number; col: number }) => void;
  isMyTurn: boolean;
}

export default function PlayerHand({ cards, onPlayCard, isMyTurn }: PlayerHandProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [animateIndex, setAnimateIndex] = useState<number | null>(null);

  useEffect(() => {
    // Reset selected card when turn changes
    if (!isMyTurn) {
      setSelectedCard(null);
    }
  }, [isMyTurn]);

  const handleCardClick = (card: Card, index: number) => {
    if (!isMyTurn) return;

    setSelectedCard(card);
    setAnimateIndex(index);

    // If it's a Jack, we can play it directly
    if (card.isJack) {
      onPlayCard(card);

      // Reset animation after a delay
      setTimeout(() => {
        setAnimateIndex(null);
      }, 500);
    }
  };

  // Function to get the card image
  const getCardImage = (card: Card) => {
    const { suit, rank } = card;
    return `/images/cards/${rank}_of_${suit}.png`;
  };

  return (
    <div className="w-full card mt-4">
      <h3 className="text-xl font-bold mb-4 text-primary">
        {isMyTurn ? (
          <span className="flex items-center">
            Your Turn
            <span className="ml-2 animate-pulse-love">❤️</span>
          </span>
        ) : (
          "Your Hand"
        )}
      </h3>

      <div className="flex justify-center overflow-x-auto pb-4 gap-3">
        {cards.map((card, index) => {
          const isSelected = selectedCard?.id === card.id;
          const isAnimating = animateIndex === index;

          return (
            <div
              key={card.id}
              className={`relative flex-shrink-0 w-20 h-28 border border-pink-100 rounded-lg overflow-hidden shadow-md
                ${isSelected ? 'transform -translate-y-4 ring-2 ring-primary z-10' : 'card-hover'}
                ${!isMyTurn ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                ${isAnimating ? 'animate-bounce' : ''}
                transition-all duration-200`}
              onClick={() => handleCardClick(card, index)}
              style={{
                transform: `rotate(${(index - (cards.length - 1) / 2) * 5}deg)`,
                transformOrigin: 'bottom center',
                marginTop: isSelected ? '0' : `${Math.abs((index - (cards.length - 1) / 2) * 2)}px`,
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={getCardImage(card)}
                  alt={`${card.rank} of ${card.suit}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 20vw, 80px"
                />
              </div>

              {card.isJack && (
                <div className={`absolute bottom-1 left-1 right-1 ${card.jackType === 'one-eyed' ? 'bg-player2' : 'bg-player1'} bg-opacity-90 text-white text-xs p-1 rounded-md`}>
                  {card.jackType === 'one-eyed' ? 'Remove Chip' : 'Wild Card'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isMyTurn && (
        <div className="text-center mt-2 p-2 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Waiting for your partner's move... 💭</p>
        </div>
      )}

      {isMyTurn && selectedCard && (
        <div className="text-center mt-2 p-2 bg-pink-50 rounded-lg">
          <p className="text-primary">Select a position on the board to place your card</p>
        </div>
      )}
    </div>
  );
}
