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
  
  // Colors
  const redColor = '#E53E3E';
  const blackColor = '#1A202C';
  
  for (const suit of suits) {
    const suitColor = suit === 'hearts' || suit === 'diamonds' ? redColor : blackColor;
    const suitSymbol = getSuitSymbol(suit);
    
    for (const rank of ranks) {
      // Create SVG for the card
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${width}" height="${height}" fill="white" rx="10" ry="10" stroke="#CBD5E0" stroke-width="2"/>
          
          <!-- Top left rank and suit -->
          <text x="15" y="40" font-family="Arial" font-size="30" font-weight="bold" fill="${suitColor}">${rank}</text>
          <text x="15" y="70" font-family="Arial" font-size="30" fill="${suitColor}">${suitSymbol}</text>
          
          <!-- Bottom right rank and suit (inverted) -->
          <text x="${width - 30}" y="${height - 30}" font-family="Arial" font-size="30" font-weight="bold" fill="${suitColor}" transform="rotate(180 ${width - 15} ${height - 45})">${rank}</text>
          <text x="${width - 30}" y="${height - 60}" font-family="Arial" font-size="30" fill="${suitColor}" transform="rotate(180 ${width - 15} ${height - 75})">${suitSymbol}</text>
          
          <!-- Center suit symbol -->
          <text x="${width / 2}" y="${height / 2 + 15}" font-family="Arial" font-size="80" fill="${suitColor}" text-anchor="middle">${suitSymbol}</text>
        </svg>
      `;
      
      // Convert SVG to PNG
      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(outputDir, `${rank}_of_${suit}.png`));
      
      console.log(`Generated ${rank}_of_${suit}.png`);
    }
  }
  
  // Create card back
  const cardBackSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#4F46E5" rx="10" ry="10" stroke="#CBD5E0" stroke-width="2"/>
      <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" rx="5" ry="5" stroke="white" stroke-width="2"/>
      <text x="${width / 2}" y="${height / 2 + 15}" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Sequence</text>
    </svg>
  `;
  
  await sharp(Buffer.from(cardBackSvg))
    .png()
    .toFile(path.join(outputDir, 'card-back.png'));
  
  console.log('Generated card-back.png');
  
  // Create free space
  const freeSpaceSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#F3F4F6" rx="10" ry="10" stroke="#CBD5E0" stroke-width="2"/>
      <text x="${width / 2}" y="${height / 2 - 10}" font-family="Arial" font-size="24" fill="#4F46E5" text-anchor="middle">FREE</text>
      <text x="${width / 2}" y="${height / 2 + 20}" font-family="Arial" font-size="24" fill="#4F46E5" text-anchor="middle">SPACE</text>
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
