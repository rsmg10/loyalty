module.exports = {
  content: ['./index.html', './src/**/*.{js,vue}'],
  theme: {
    extend: {
      colors: {
        night: '#1f1a26',
        haze: '#f8f3ee',
        coral: '#ff7b5c',
        ocean: '#2f8fa4',
        dusk: '#342f3b',
        cream: '#f1e6db',
        moss: '#5d7f65'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 0 rgba(255, 123, 92, 0.0)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 123, 92, 0.18)' }
        }
      },
      animation: {
        floatUp: 'floatUp 0.5s ease-out both',
        glow: 'glow 6s ease-in-out infinite alternate'
      }
    }
  },
  plugins: []
};
