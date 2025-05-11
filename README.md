# Sequence Game

A beautiful online multiplayer Sequence card game built with Next.js, Prisma, MongoDB, and Socket.io.

## Features

- Real-time multiplayer gameplay
- Beautiful card designs generated with Sharp
- Room-based gameplay for 1v1 matches
- MongoDB database for game state persistence
- Responsive design for desktop and mobile

## Game Rules

Sequence is a board game that combines elements of card games and strategy:

1. Players take turns playing cards from their hand and placing chips on the corresponding spaces on the board.
2. The goal is to form sequences of 5 chips in a row (horizontally, vertically, or diagonally).
3. Special cards (Jacks) have special powers:
   - Two-eyed Jacks (Diamonds, Clubs) are wild and can be placed anywhere.
   - One-eyed Jacks (Hearts, Spades) can remove an opponent's chip.
4. The first player to form 2 sequences wins the game.

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sequence-game.git
   cd sequence-game
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following:
   ```
   DATABASE_URL="your-mongodb-connection-string"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Generate card images:
   ```
   npm run generate-cards
   ```

5. Generate Prisma client:
   ```
   npx prisma generate
   ```

6. Run the development server:
   ```
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. Create a room or join an existing room with a room code.
2. Wait for another player to join.
3. The host can start the game once two players have joined.
4. Take turns playing cards from your hand to place chips on the board.
5. Form sequences of 5 chips in a row to win!

## Technologies Used

- Next.js - React framework
- Prisma - Database ORM
- MongoDB - Database
- Socket.io - Real-time communication
- Sharp - Image processing
- Tailwind CSS - Styling

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Sequence Game](https://en.wikipedia.org/wiki/Sequence_(game)) - Original board game
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Socket.io](https://socket.io/) - Real-time communication
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
