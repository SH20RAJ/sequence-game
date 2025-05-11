'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading game...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background bg-hearts-pattern z-50">
      <div className="card p-8 text-center max-w-md animate-float">
        <h2 className="text-2xl font-bold love-title mb-4">Love Sequence</h2>
        
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary rounded-full opacity-25 animate-ping"></div>
          <div className="relative flex items-center justify-center w-24 h-24 bg-primary bg-opacity-50 rounded-full">
            <span className="text-4xl">❤️</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-2">{message}</p>
        
        <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden mt-4">
          <div className="bg-gradient-love h-full animate-pulse-love" style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  );
}
