module.exports = {
  content: ['./index.html', './src/**/*.{js,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#1d1a1a',
        sand: '#f5efe6',
        ember: '#ff6b3d',
        tide: '#1b8a7a',
        dusk: '#2f2b33',
        mist: '#e6ded2',
        clay: '#c86f4a'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      boxShadow: {
        lift: '0 18px 50px -24px rgba(28, 18, 12, 0.45)',
        card: '0 24px 60px -35px rgba(34, 24, 16, 0.55)'
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' }
        }
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        shimmer: 'shimmer 8s ease-in-out infinite alternate'
      }
    }
  },
  plugins: []
};
