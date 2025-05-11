const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Function to generate card images
async function generateCardImages() {
  const outputDir = path.join(process.cwd(), 'public/images/cards');

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Card dimensions
  const width = 200;
  const height = 300;

  // Colors - more romantic theme
  const redColor = '#FF4B91'; // Pink for hearts and diamonds
  const blackColor = '#6B7FFF'; // Blue for clubs and spades

  for (const suit of suits) {
    const suitColor = suit === 'hearts' || suit === 'diamonds' ? redColor : blackColor;
    const suitSymbol = getSuitSymbol(suit);

    for (const rank of ranks) {
      // Create SVG for the card with a more romantic design
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#FFF0F5" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${suitColor}" flood-opacity="0.1"/>
            </filter>
          </defs>

          <!-- Card background with rounded corners and gradient -->
          <rect width="${width}" height="${height}" fill="url(#cardGradient)" rx="15" ry="15" stroke="${suitColor}" stroke-width="2" stroke-opacity="0.3" filter="url(#shadow)"/>

          <!-- Decorative corner flourishes -->
          <path d="M15,15 C25,5 35,15 25,25 C15,35 5,25 15,15 Z" fill="${suitColor}" fill-opacity="0.1" />
          <path d="M${width - 15},15 C${width - 25},5 ${width - 35},15 ${width - 25},25 C${width - 15},35 ${width - 5},25 ${width - 15},15 Z" fill="${suitColor}" fill-opacity="0.1" />
          <path d="M15,${height - 15} C25,${height - 5} 35,${height - 15} 25,${height - 25} C15,${height - 35} 5,${height - 25} 15,${height - 15} Z" fill="${suitColor}" fill-opacity="0.1" />
          <path d="M${width - 15},${height - 15} C${width - 25},${height - 5} ${width - 35},${height - 15} ${width - 25},${height - 25} C${width - 15},${height - 35} ${width - 5},${height - 25} ${width - 15},${height - 15} Z" fill="${suitColor}" fill-opacity="0.1" />

          <!-- Top left rank and suit -->
          <text x="15" y="40" font-family="Arial" font-size="30" font-weight="bold" fill="${suitColor}">${rank}</text>
          <text x="15" y="70" font-family="Arial" font-size="30" fill="${suitColor}">${suitSymbol}</text>

          <!-- Bottom right rank and suit (inverted) -->
          <text x="${width - 30}" y="${height - 30}" font-family="Arial" font-size="30" font-weight="bold" fill="${suitColor}" transform="rotate(180 ${width - 15} ${height - 45})">${rank}</text>
          <text x="${width - 30}" y="${height - 60}" font-family="Arial" font-size="30" fill="${suitColor}" transform="rotate(180 ${width - 15} ${height - 75})">${suitSymbol}</text>

          <!-- Center suit symbol with glow effect -->
          <text x="${width / 2}" y="${height / 2 + 15}" font-family="Arial" font-size="80" fill="${suitColor}" text-anchor="middle" filter="url(#shadow)">${suitSymbol}</text>

          <!-- Subtle pattern overlay -->
          ${suit === 'hearts' ? `<path d="M${width/2},${height/2 - 40} C${width/2 - 20},${height/2 - 60} ${width/2 - 40},${height/2 - 40} ${width/2 - 20},${height/2 - 20} C${width/2},${height/2} ${width/2 + 20},${height/2 - 20} ${width/2 + 40},${height/2 - 40} C${width/2 + 20},${height/2 - 60} ${width/2},${height/2 - 40} ${width/2},${height/2 - 40} Z" fill="${suitColor}" fill-opacity="0.1" />` : ''}
        </svg>
      `;

      // Convert SVG to PNG
      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(outputDir, `${rank}_of_${suit}.png`));

      console.log(`Generated ${rank}_of_${suit}.png`);
    }
  }

  // Create a romantic card back
  const cardBackSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="loveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF4B91" />
          <stop offset="100%" stop-color="#FF8DC7" />
        </linearGradient>
        <pattern id="heartPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20,10 C20,10 15,0 10,0 C5,0 0,5 0,10 C0,20 20,30 20,30 C20,30 40,20 40,10 C40,5 35,0 30,0 C25,0 20,10 20,10 Z" fill="white" fill-opacity="0.1" />
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#loveGradient)" rx="15" ry="15" stroke="white" stroke-width="2"/>
      <rect width="${width}" height="${height}" fill="url(#heartPattern)" rx="15" ry="15"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" fill="none" rx="10" ry="10" stroke="white" stroke-width="2" stroke-opacity="0.5"/>

      <!-- Title -->
      <text x="${width / 2}" y="${height / 2 - 15}" font-family="Arial" font-size="28" font-weight="bold" fill="white" text-anchor="middle">Love</text>
      <text x="${width / 2}" y="${height / 2 + 15}" font-family="Arial" font-size="28" font-weight="bold" fill="white" text-anchor="middle">Sequence</text>

      <!-- Hearts at corners -->
      <text x="25" y="35" font-family="Arial" font-size="24" fill="white">❤️</text>
      <text x="${width - 25}" y="35" font-family="Arial" font-size="24" fill="white" text-anchor="end">❤️</text>
      <text x="25" y="${height - 15}" font-family="Arial" font-size="24" fill="white">❤️</text>
      <text x="${width - 25}" y="${height - 15}" font-family="Arial" font-size="24" fill="white" text-anchor="end">❤️</text>
    </svg>
  `;

  await sharp(Buffer.from(cardBackSvg))
    .png()
    .toFile(path.join(outputDir, 'card-back.png'));

  console.log('Generated card-back.png');

  // Create romantic free space
  const freeSpaceSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="freeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF0F5" />
          <stop offset="100%" stop-color="#FFACC7" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#freeGradient)" rx="15" ry="15" stroke="#FF4B91" stroke-width="2"/>

      <!-- Heart background -->
      <path d="M${width/2},${height/2 - 40} C${width/2 - 40},${height/2 - 80} ${width/2 - 80},${height/2 - 40} ${width/2 - 40},${height/2} C${width/2},${height/2 + 40} ${width/2 + 40},${height/2} ${width/2 + 80},${height/2 - 40} C${width/2 + 40},${height/2 - 80} ${width/2},${height/2 - 40} ${width/2},${height/2 - 40} Z" fill="#FF4B91" fill-opacity="0.1" />

      <!-- Free Space text -->
      <text x="${width / 2}" y="${height / 2 - 15}" font-family="Arial" font-size="28" font-weight="bold" fill="#FF4B91" text-anchor="middle" filter="url(#glow)">FREE</text>
      <text x="${width / 2}" y="${height / 2 + 20}" font-family="Arial" font-size="28" font-weight="bold" fill="#FF4B91" text-anchor="middle" filter="url(#glow)">SPACE</text>

      <!-- Heart icon -->
      <text x="${width / 2}" y="${height / 2 + 70}" font-family="Arial" font-size="40" fill="#FF4B91" text-anchor="middle">❤️</text>
    </svg>
  `;

  await sharp(Buffer.from(freeSpaceSvg))
    .png()
    .toFile(path.join(outputDir, 'free-space.png'));

  console.log('Generated free-space.png');

  console.log('All card images generated successfully!');
}

// Helper function to get suit symbol
function getSuitSymbol(suit) {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
  }
}

// Run the function
generateCardImages().catch(console.error);
