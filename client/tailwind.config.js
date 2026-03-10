/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        sidebar: '#f5f5f7',
        surface: '#ffffff',
        borderSubtle: '#e5e7eb',
      },
    },
  },
  plugins: [],
};

