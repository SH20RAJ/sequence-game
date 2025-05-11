import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle Socket.io requests
  if (request.nextUrl.pathname.startsWith('/api/socket')) {
    // Allow WebSocket upgrade
    if (request.headers.get('upgrade') === 'websocket') {
      return NextResponse.next();
    }
    
    // Handle HTTP requests to the Socket.io endpoint
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/socket/:path*'],
};
