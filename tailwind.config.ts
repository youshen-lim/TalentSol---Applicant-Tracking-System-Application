import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        ats: {
          blue: "#3B82F6",
          "light-blue": "#60A5FA",
          "dark-blue": "#2563EB",
          gray: "#f8f9fa",
          "dark-gray": "#343a40",
          "border-gray": "#e9ecef",
          purple: "#8A70D6",
          "light-purple": "#9b87f5",
          "dark-purple": "#6046b6"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      // TalentSol standardized spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',

        // === TALENTSOL DESIGN SYSTEM SPACING === //
        // Component-specific spacing tokens
        'card-inner': '2rem',           // 32px - internal card padding (enhanced from 24px)
        'card-inner-sm': '1.5rem',      // 24px - smaller card padding
        'card-gap': '2rem',             // 32px - between cards (enhanced from 20px)
        'card-gap-sm': '1.5rem',        // 24px - smaller card gaps

        // Section spacing tokens
        'section': '2.5rem',            // 40px - between major sections
        'section-lg': '3rem',           // 48px - between page sections
        'section-xl': '4rem',           // 64px - between major page blocks

        // Header and navigation spacing
        'header-bottom': '2rem',        // 32px - below page headers (enhanced from 24px)
        'nav-padding': '1.25rem',       // 20px - navigation element padding
        'tab-padding': '1.5rem',        // 24px - tab navigation padding

        // Layout spacing tokens
        'page-x': '1.5rem',             // 24px - horizontal page margins
        'page-y': '2rem',               // 32px - vertical page margins
        'container-padding': '2rem',    // 32px - main container padding

        // Metric and data display spacing
        'metric-gap': '1.5rem',         // 24px - between metric elements
        'data-spacing': '0.75rem',      // 12px - between data points
        'chart-padding': '2rem',        // 32px - chart container padding

        // Interactive element spacing
        'button-gap': '0.75rem',        // 12px - between buttons
        'form-gap': '1.5rem',           // 24px - between form elements
        'input-padding': '0.75rem',     // 12px - input internal padding
      },
      // TalentSol standardized typography scale
      fontSize: {
        'metric': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }], // 32px bold for metrics
        'page-title': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }], // 24px semi-bold for page titles
        'section-header': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px semi-bold for headers
      },
      // TalentSol standardized shadows
      boxShadow: {
        'ats-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'ats-card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'ats-modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'ats-dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // TalentSol standardized gradients
      backgroundImage: {
        'ats-blue-gradient': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        'ats-purple-gradient': 'linear-gradient(135deg, #8A70D6 0%, #6046b6 100%)',
        'ats-status-applied': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        'ats-status-screening': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        'ats-status-interview': 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        'ats-status-offer': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'ats-status-hired': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'ats-status-rejected': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities, addComponents }) {
      // === TALENTSOL DESIGN SYSTEM COMPONENTS === //
      addComponents({
        // Page layout components
        '.page-container': {
          '@apply min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -m-6 p-6': {},
        },
        '.page-content': {
          '@apply max-w-7xl mx-auto space-y-section-lg px-page-x py-page-y': {},
        },
        '.page-content-narrow': {
          '@apply max-w-4xl mx-auto space-y-section-lg px-page-x py-page-y': {},
        },

        // Card components
        '.metric-card': {
          '@apply bg-white rounded-lg border border-gray-200 p-card-inner hover:border-blue-300 transition-colors duration-200': {},
        },
        '.metric-card-sm': {
          '@apply bg-white rounded-lg border border-gray-200 p-card-inner-sm hover:border-blue-300 transition-colors duration-200': {},
        },
        '.chart-container': {
          '@apply bg-white rounded-lg border border-gray-200 p-chart-padding': {},
        },

        // Grid layouts
        '.metric-cards-grid': {
          '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-card-gap': {},
        },
        '.content-grid': {
          '@apply grid grid-cols-1 lg:grid-cols-2 gap-card-gap': {},
        },

        // Section spacing
        '.page-section': {
          '@apply mb-section-lg': {},
        },
        '.content-section': {
          '@apply space-y-section': {},
        },

        // Navigation components
        '.tab-navigation': {
          '@apply border-b border-gray-200 mb-section mt-header-bottom': {},
        },
        '.tab-nav-container': {
          '@apply flex space-x-8 px-2': {},
        },
        '.tab-button': {
          '@apply py-5 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200': {},
        },

        // Header components
        '.section-header': {
          '@apply flex items-center justify-between py-4': {},
        },
        '.section-title': {
          '@apply text-lg font-semibold text-gray-900': {},
        },
        '.section-subtitle': {
          '@apply text-sm text-gray-500 mt-2': {},
        },
      });

      addUtilities({
        // Enhanced scrollbar system - consolidated from enhanced-scroll.css
        ".enhanced-scrollbar": {
          "scrollbar-width": "thin",
          "scrollbar-color": "#d1d5db transparent"
        },
        ".enhanced-scrollbar::-webkit-scrollbar": {
          width: "8px",
          height: "8px"
        },
        ".enhanced-scrollbar::-webkit-scrollbar-track": {
          background: "transparent",
          "border-radius": "4px"
        },
        ".enhanced-scrollbar::-webkit-scrollbar-thumb": {
          background: "#d1d5db",
          "border-radius": "4px",
          border: "1px solid transparent",
          "background-clip": "content-box"
        },
        ".enhanced-scrollbar::-webkit-scrollbar-thumb:hover": {
          background: "#9ca3af",
          "background-clip": "content-box"
        },
        ".enhanced-scrollbar::-webkit-scrollbar-thumb:active": {
          background: "#6b7280",
          "background-clip": "content-box"
        },
        // Blue themed scrollbar
        ".enhanced-scrollbar-blue": {
          "scrollbar-width": "thin",
          "scrollbar-color": "#93c5fd transparent"
        },
        ".enhanced-scrollbar-blue::-webkit-scrollbar": {
          width: "8px",
          height: "8px"
        },
        ".enhanced-scrollbar-blue::-webkit-scrollbar-track": {
          background: "transparent",
          "border-radius": "4px"
        },
        ".enhanced-scrollbar-blue::-webkit-scrollbar-thumb": {
          background: "#93c5fd",
          "border-radius": "4px",
          border: "1px solid transparent",
          "background-clip": "content-box"
        },
        ".enhanced-scrollbar-blue::-webkit-scrollbar-thumb:hover": {
          background: "#60a5fa",
          "background-clip": "content-box"
        },
        ".enhanced-scrollbar-blue::-webkit-scrollbar-thumb:active": {
          background: "#3b82f6",
          "background-clip": "content-box"
        },
        // Auto-hide scrollbar
        ".scrollbar-auto-hide": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none"
        },
        ".scrollbar-auto-hide::-webkit-scrollbar": {
          display: "none"
        },
        ".scrollbar-auto-hide:hover": {
          "scrollbar-width": "thin",
          "scrollbar-color": "#d1d5db transparent"
        },
        ".scrollbar-auto-hide:hover::-webkit-scrollbar": {
          display: "block",
          width: "6px",
          height: "6px"
        },
        ".scrollbar-auto-hide:hover::-webkit-scrollbar-track": {
          background: "transparent"
        },
        ".scrollbar-auto-hide:hover::-webkit-scrollbar-thumb": {
          background: "#d1d5db",
          "border-radius": "3px"
        },
        // Legacy utilities (maintained for compatibility)
        ".scrollbar-thin": {
          "scrollbar-width": "thin"
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "8px",
          height: "8px"
        },
        ".scrollbar-track-transparent::-webkit-scrollbar-track": {
          background: "transparent"
        },
        ".scrollbar-thumb-gray-300::-webkit-scrollbar-thumb": {
          background: "#d1d5db",
          "border-radius": "4px"
        },
        ".scrollbar-thumb-gray-400::-webkit-scrollbar-thumb": {
          background: "#9ca3af",
          "border-radius": "4px"
        },
        ".scrollbar-thumb-ats-light-blue\\/60::-webkit-scrollbar-thumb": {
          background: "rgba(147, 197, 253, 0.6)",
          "border-radius": "4px"
        },
        ".scrollbar-thumb-ats-blue::-webkit-scrollbar-thumb": {
          background: "#3b82f6",
          "border-radius": "4px"
        }
      });
    }
  ],
} satisfies Config;

export default config;
