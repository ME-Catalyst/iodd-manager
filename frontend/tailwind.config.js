/** @type {import('tailwindcss').Config} */
// Import the immutable brand color from centralized theme config
const BRAND_GREEN = '#3DB60F';

module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Greenstack immutable brand color
        'brand-green': {
          DEFAULT: BRAND_GREEN,
          50: '#f0fde9',
          100: '#dafbc7',
          200: '#b8f68f',
          300: '#8eeb4d',
          400: '#6ed91e',
          500: BRAND_GREEN, // #3DB60F - Primary brand color
          600: '#2f990c',
          700: '#24750d',
          800: '#1f5c0f',
          900: '#1c4d11',
          950: '#092b04',
        },
        primary: {
          DEFAULT: BRAND_GREEN,
          dark: "#32a00c",
          light: "#51cf66",
          50: '#f0fde9',
          100: '#dafbc7',
          200: '#b8f68f',
          300: '#8eeb4d',
          400: '#6ed91e',
          500: BRAND_GREEN,
          600: '#2f990c',
          700: '#24750d',
          800: '#1f5c0f',
          900: '#1c4d11',
        },
        secondary: {
          DEFAULT: "#667eea",
          dark: "#5168d4",
          light: "#8b9dff",
          50: "#f0f2ff",
          100: "#d4daff",
          200: "#b8c2ff",
          300: "#9caaf7",
          400: "#8094f1",
          500: "#667eea",
          600: "#5168d4",
          700: "#3d52be",
          800: "#293ca8",
          900: "#152692",
        },
        success: {
          DEFAULT: "#51cf66",
          dark: "#32b84d",
          light: "#70d682",
        },
        warning: {
          DEFAULT: "#ffd43b",
          dark: "#ffcc00",
          light: "#ffe066",
        },
        danger: {
          DEFAULT: "#ff6b6b",
          dark: "#ff4757",
          light: "#ff8787",
        },
        dark: {
          DEFAULT: "#0a0e27",
          lighter: "#151935",
          card: "#1a1f3a",
          border: "#2a3050",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': `linear-gradient(135deg, ${BRAND_GREEN} 0%, #2d5016 100%)`,
        'gradient-success': 'linear-gradient(135deg, #51cf66 0%, #32b84d 100%)',
        'gradient-info': `linear-gradient(135deg, ${BRAND_GREEN} 0%, #2f990c 100%)`,
        'gradient-danger': 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
        'gradient-warning': 'linear-gradient(135deg, #ffd43b 0%, #ffac30 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #151935 100%)',
        'gradient-mesh': `radial-gradient(at 20% 80%, rgba(61, 182, 15, 0.1) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(81, 207, 102, 0.1) 0%, transparent 50%), radial-gradient(at 40% 40%, rgba(45, 80, 22, 0.1) 0%, transparent 50%)`,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.9)", opacity: 0 },
          to: { transform: "scale(1)", opacity: 1 },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(61, 182, 15, 0.5)",
            transform: "scale(1)"
          },
          "50%": {
            boxShadow: "0 0 40px rgba(61, 182, 15, 0.8)",
            transform: "scale(1.05)"
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "spin-slow": "spin-slow 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(61, 182, 15, 0.5)',
        'glow-md': '0 0 20px rgba(61, 182, 15, 0.5)',
        'glow-lg': '0 0 30px rgba(61, 182, 15, 0.5)',
        'glow-xl': '0 0 40px rgba(61, 182, 15, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(61, 182, 15, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        '.text-gradient': {
          'background': `linear-gradient(135deg, ${BRAND_GREEN} 0%, #2d5016 100%)`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-primary': {
          'background': `linear-gradient(135deg, ${BRAND_GREEN} 0%, #51cf66 100%)`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass': {
          'background': 'rgba(26, 31, 58, 0.7)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(42, 48, 80, 0.5)',
        },
        '.glass-dark': {
          'background': 'rgba(10, 14, 39, 0.8)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(42, 48, 80, 0.3)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
