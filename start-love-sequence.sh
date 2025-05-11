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

npm run dev
