import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        // 大字體設定（年長使用者）
        base: ['16px', '1.6'],
        lg: ['18px', '1.6'],
        xl: ['20px', '1.5'],
        '2xl': ['24px', '1.4'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
