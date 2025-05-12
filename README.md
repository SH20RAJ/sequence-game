# Love Sequence Game

A beautiful online multiplayer Sequence card game designed specifically for couples, built with Next.js, Prisma, MongoDB, and Socket.io. This romantic version features a love-themed design with hearts, pink colors, and special animations.

## Features

- Beautiful romantic design with hearts and love-themed elements
- Real-time multiplayer gameplay specifically designed for couples (1v1)
- Room creation and joining functionality with easy sharing options
- Beautiful card designs generated with Sharp
- MongoDB database for game state persistence
- Responsive design for desktop and mobile
- Animated UI elements and notifications for a better experience

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

### Quick Start

The easiest way to start the game is to use the provided script:

```bash
npm run game
```

This will:
1. Install dependencies
2. Generate the Prisma client
3. Create card images
4. Start the development server

### Manual Installation

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

### Sharing with Your Partner

To play with your partner:

1. Make sure you're both on the same network
2. Find your computer's local IP address
3. Share the URL with your partner: `http://YOUR_IP_ADDRESS:3000`
4. Create a room and share the room code with your partner
5. Your partner can join using the room code

## How to Play

1. **Create a Room**: The first player creates a room and gets a room code
2. **Share the Code**: Share the room code with your partner using the copy or share buttons
3. **Join the Room**: Your partner joins using the room code
4. **Start the Game**: Once both players are in, the host can start the game
5. **Take Turns**: Players take turns placing chips on the board by playing cards from their hand
6. **Form Sequences**: The goal is to form sequences of 5 chips in a row (horizontally, vertically, or diagonally)
7. **Win the Game**: The first player to form 2 sequences wins!

## Troubleshooting

If you encounter any issues:

- **Connection Errors**: Make sure both players are on the same network
- **Loading Issues**: Try refreshing the page
- **Game Not Starting**: Make sure both players have joined the room
- **Card Images Not Showing**: Run `npm run generate-cards` to create the card images

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

Created with love for couples who enjoy playing games together. ❤️
