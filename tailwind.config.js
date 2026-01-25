/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1E88E5',
                    dark: '#0F4C81',
                },
                accent: {
                    DEFAULT: '#22C55E',
                    hover: '#16A34A',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Poppins', 'sans-serif'],
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to right, #0F4C81, #1E88E5)',
            }
        },
    },
    plugins: [],
}
