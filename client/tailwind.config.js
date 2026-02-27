/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        godam: {
          forest: '#25671E',
          'forest-light': '#2d7a23',
          'forest-dark': '#1d5117',
          leaf: '#48A111',
          'leaf-light': '#5ab81a',
          'leaf-dark': '#3a860e',
          sun: '#F2B50B',
          'sun-light': '#f5c53a',
          'sun-dark': '#d9a00a',
          cream: '#F7F0F0',
          'cream-dark': '#ede3e3',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-godam': 'linear-gradient(135deg, #25671E 0%, #48A111 50%, #F2B50B 100%)',
        'gradient-forest': 'linear-gradient(180deg, #1a1a2e 0%, #25671E 50%, #48A111 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f1419 0%, #1a2e1a 30%, #25671E 70%, #1a2e1a 100%)',
      },
      boxShadow: {
        'godam': '0 10px 40px -10px rgba(37, 103, 30, 0.3)',
        'godam-lg': '0 20px 60px -15px rgba(37, 103, 30, 0.4)',
        'sun': '0 10px 40px -10px rgba(242, 181, 11, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'gradient': 'gradient 4s ease infinite',
        'grain': 'grain 8s steps(10) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-30px) translateX(-15px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '30%': { transform: 'translate(3%, -15%)' },
          '50%': { transform: 'translate(12%, 9%)' },
          '70%': { transform: 'translate(9%, 4%)' },
          '90%': { transform: 'translate(-1%, 7%)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
