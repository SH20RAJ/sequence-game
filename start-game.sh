#!/bin/bash

echo "💖 Starting Love Sequence Game 💖"
echo "=================================="

# Create necessary directories
echo "Creating directories..."
mkdir -p public/images/cards

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Setting up database..."
npx prisma generate

# Generate card images
echo "Generating beautiful card designs..."
node scripts/generate-cards.js

# Start the development server
echo "Starting the game server..."
echo "Once the server is running, open http://localhost:3000 in your browser"
echo "=================================="
echo "Share the game with your loved one and enjoy playing together! ❤️"
echo "=================================="
echo "To share with your girlfriend, make sure you're on the same network"
echo "and share your computer's local IP address with port 3000"
echo "For example: http://192.168.1.X:3000"
echo "=================================="

# Start the development server
npm run dev
