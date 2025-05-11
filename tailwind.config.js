/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4B91', // Romantic pink
        secondary: '#FF8DC7', // Lighter pink
        accent: '#FFACC7', // Soft pink
        background: '#FFF0F5', // Lavender blush
        card: '#FFFFFF',
        love: '#FF6B6B', // Love red
        player1: '#FF4B91', // Player 1 color (pink)
        player2: '#6B7FFF', // Player 2 color (blue)
      },
      backgroundImage: {
        'gradient-love': 'linear-gradient(to right, #FF4B91, #FF8DC7)',
        'hearts-pattern': "url('/images/hearts-pattern.png')",
      },
      boxShadow: {
        'love': '0 4px 14px 0 rgba(255, 75, 145, 0.25)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-love': 'pulse-love 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-love': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
      },
    },
  },
  plugins: [],
};
