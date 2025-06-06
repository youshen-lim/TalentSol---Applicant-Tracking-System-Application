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
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
