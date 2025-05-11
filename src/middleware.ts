import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle Socket.io requests
  if (request.nextUrl.pathname.startsWith('/api/socket')) {
    // Allow WebSocket upgrade
    if (request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
      // Add CORS headers for WebSocket
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // Handle HTTP requests to the Socket.io endpoint
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/socket/:path*'],
};
