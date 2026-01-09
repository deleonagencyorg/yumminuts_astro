module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  safelist: [
    'bg-primary', 'text-primary', 'border-primary',
    'bg-secondary', 'text-secondary', 'border-secondary',
    'bg-tertiary', 'text-tertiary', 'border-tertiary',
    'bg-white', 'text-white', 'border-white',
    'bg-blue', 'text-blue', 'border-blue',
    'bg-orange', 'text-orange', 'border-orange',
    'bg-yellow', 'text-yellow', 'border-yellow',
    'bg-pink', 'text-pink', 'border-pink',
    'bg-quinary', 'text-quinary', 'border-quinary',
    'bg-brown', 'text-brown', 'border-brown',
    'bg-green', 'text-green', 'border-green',
    ],
  theme: {
    extend: {
      colors: {
        primary: '#385CAD',
        secondary: '#B5D3ED',
        tertiary: '#DC9EE5',
        cuaternary: '#9AE3BE',
        quinary: '#9AE3BE',
        white: '#FFFFFF',
        brown: '#847174',
        blue: '#385CAD',
        green: '#C3DDA1',
        orange: '#FD6600',
        yellow: '#FDE820',
        pink: '#F0ABB8',
        skyblue: '#B7E4FF',

      },
      fontFamily: {
        sans: ['bespoke-serif', 'sans-serif'],
        title: ['a-love-of-thunder', 'serif'],
        heading: ['bespoke-bold', 'sans-serif'],
        text: ['bespoke-serif', 'sans-serif']
      },
      animation: {
        'spin-slow': 'spin 5s linear infinite',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
}