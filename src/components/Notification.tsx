'use client';

import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!isVisible) return null;
  
  const bgColor = 
    type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
    type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
    'bg-blue-100 border-blue-500 text-blue-700';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} border-l-4 p-4 rounded shadow-md z-50 animate-float`}>
      {message}
      <button 
        className="ml-4 text-sm opacity-70 hover:opacity-100"
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
      >
        ✕
      </button>
    </div>
  );
}

// Helper function to show notifications
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
  // Create notification container if it doesn't exist
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-0 right-0 p-4 z-50 flex flex-col items-end gap-2';
    document.body.appendChild(container);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  const bgColor = 
    type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
    type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
    'bg-blue-100 border-blue-500 text-blue-700';
  
  notification.className = `${bgColor} border-l-4 p-4 rounded shadow-md animate-float`;
  notification.innerHTML = message;
  
  // Add to container
  container.appendChild(notification);
  
  // Remove after duration
  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}
