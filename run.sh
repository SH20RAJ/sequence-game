#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Generate card images
echo "Generating card images..."
npm run generate-cards

# Start the development server
echo "Starting development server..."
npm run dev
