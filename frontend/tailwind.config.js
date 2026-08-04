/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06080E',
          900: '#0A0D14', // Deep Obsidian Background
          800: '#121723',
          700: '#1C2333',
          600: '#2A344A',
        },
        violet: {
          accent: '#7C3AED', // Neon Violet
          glow: '#9333EA',
        },
        cyan: {
          glow: '#06B6D4',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'violet-cyan-gradient': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
        'glowing-border': 'linear-gradient(90deg, #7C3AED, #06B6D4, #7C3AED)',
      },
      boxShadow: {
        'violet-glow': '0 0 25px -5px rgba(124, 58, 237, 0.4)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
