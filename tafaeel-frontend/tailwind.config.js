/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
        container: {
            center: true,
            padding: '12px'
        },
        screens: {
            'xs': '360px',
            'sm': '414px',
            'md': '768px',
            'lg': '992px',
            'xl': '1200px',
            '2xl': '1320px',
            '3xl': '1440px'
        },
        // colors: {
        //     primary: '#00FFFF',
        //     secondary: '#0152FF',
        //     body: '#B2B0B9',
        //     bg: '#060706',
        //     white: '#ffffff',
        //     black: '#000000',
        //     transparent: 'transparent'
        // },
        fontFamily: {
            roboto: `"Roboto", sans-serif`,
        },
    },
    darkMode: "class",
    plugins: [],
}