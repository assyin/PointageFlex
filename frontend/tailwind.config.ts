import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette principale selon Colors Styles.md
        primary: {
          DEFAULT: '#0052CC',
          hover: '#0041A8',
          50: '#E6F0FF',
          100: '#CCE0FF',
          500: '#0052CC',
          600: '#0041A8',
        },
        secondary: {
          DEFAULT: '#00A3FF',
          hover: '#008ECC',
        },
        success: {
          DEFAULT: '#28A745',
          hover: '#1E7C34',
        },
        warning: {
          DEFAULT: '#FFC107',
          hover: '#E0A800',
        },
        danger: {
          DEFAULT: '#DC3545',
          hover: '#B02A37',
        },
        info: {
          DEFAULT: '#17A2B8',
        },
        background: {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
        },
        text: {
          primary: '#212529',
          secondary: '#6C757D',
        },
        // Shifts colors
        shift: {
          matin: '#00A3FF',
          soir: '#0052CC',
          nuit: '#212529',
        },
        // Borders & Input
        border: {
          DEFAULT: '#CED4DA',
          light: '#DEE2E6',
        },
        input: {
          DEFAULT: '#FFFFFF',
          border: '#CED4DA',
          placeholder: '#6C757D',
        },
        table: {
          header: '#F1F3F5',
          hover: '#E9ECEF',
          border: '#DEE2E6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'button': '8px',
        'input': '6px',
        'card': '8px',
        'modal': '10px',
      },
      spacing: {
        'sidebar': '250px',
        'header': '64px',
      },
      boxShadow: {
        'card': '0 2px 6px rgba(0,0,0,0.05)',
        'hover': '0px 2px 6px rgba(0,0,0,0.1)',
        'modal': '0 4px 12px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
