/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    dark: '#050510',
                    light: '#0a0b1e',
                    neon: '#00f0ff',
                    purple: '#7000ff',
                    pink: '#ff00aa',
                    dim: 'rgba(5, 5, 16, 0.8)',
                },
                brand: {
                    primary: '#00f0ff', // Neon Cyan
                    secondary: '#7000ff', // Electric Purple
                    accent: '#ff00aa', // Cyber Pink
                    dark: '#050510', // Deep Space
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Space Mono', 'monospace'], // For crypto addresses/amounts
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #00f0ff, 0 0 10px #00f0ff' },
                    '100%': { boxShadow: '0 0 20px #00f0ff, 0 0 30px #00f0ff' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
