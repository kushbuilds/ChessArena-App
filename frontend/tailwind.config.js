/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chess: {
          bg:     '#262421',
          card:   '#312e2b',
          light:  '#EEEED2',
          dark:   '#769656',
          accent: '#81B64C',
          text:   '#BABABA',
          bright: '#E8E8E8',
          navbar: '#1a1a1a',
          border: '#3d3b39',
          hover:  '#3d3a37',
          red:    '#c62828',
          yellow: '#f9a825',
          blue:   '#1565c0',
        },
      },
    },
  },
  plugins: [],
}
