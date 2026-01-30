/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: '#151d28',
                'bg-alt': '#303050',
                'bg-dark': '#121821',
                'blue-300': '#a38529',
                'yellow-500': '#D2BF55',
                'yellow-700': '#7D6C0C',
                paper: '#f1f1da',
            },
        },
    },
    plugins: [],
};
