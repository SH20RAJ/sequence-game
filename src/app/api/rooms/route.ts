import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateRoomCode } from '@/utils/game';

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Generate a unique room code
    const roomCode = generateRoomCode();
    
    // Create a new user
    const user = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '')}_${Date.now()}@temp.com`, // Temporary email
      },
    });
    
    // Create a new game room
    const game = await prisma.game.create({
      data: {
        roomCode,
        hostId: user.id,
        status: 'waiting',
      },
    });
    
    // Add the user as a player in the game
    await prisma.playerToGame.create({
      data: {
        playerId: user.id,
        gameId: game.id,
      },
    });
    
    return NextResponse.json({ roomCode });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { message: 'Failed to create room' },
      { status: 500 }
    );
  }
}
