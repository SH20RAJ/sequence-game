import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { roomCode: string } }
) {
  try {
    const { roomCode } = params;
    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Find the game room
    const game = await prisma.game.findUnique({
      where: { roomCode },
      include: {
        playerToGame: true,
      },
    });
    
    if (!game) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }
    
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { message: 'Game has already started' },
        { status: 400 }
      );
    }
    
    if (game.playerToGame.length >= 2) {
      return NextResponse.json(
        { message: 'Room is full' },
        { status: 400 }
      );
    }
    
    // Create a new user
    const user = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '')}_${Date.now()}@temp.com`, // Temporary email
      },
    });
    
    // Add the user as a player in the game
    await prisma.playerToGame.create({
      data: {
        playerId: user.id,
        gameId: game.id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { message: 'Failed to join room' },
      { status: 500 }
    );
  }
}
