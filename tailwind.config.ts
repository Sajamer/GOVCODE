import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import { withUt } from 'uploadthing/tw'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1700px',
      },
      colors: {
        neutral: {
          '0': 'var(--neutral-0)',
          '50': 'var(--neutral-50)',
          '100': 'var(--neutral-100)',
          '200': 'var(--neutral-200)',
          '300': 'var(--neutral-300)',
          '400': 'var(--neutral-400)',
          '500': 'var(--neutral-500)',
          '600': 'var(--neutral-600)',
          '700': 'var(--neutral-700)',
          '800': 'var(--neutral-800)',
          '900': 'var(--neutral-900)',
          '1000': 'var(--neutral-1000)',
          alpha_100: 'var(--neutral-alpha-100)',
          alpha_200: 'var(--neutral-alpha-200)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          disabled: 'var(--primary-disabled)',
          light: 'var(--primary-light)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          disabled: 'var(--secondary-disabled)',
          light: 'var(--secondary-light)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          disabled: 'var(--destructive-disabled)',
          light: 'var(--destructive-light)',
          hover: 'var(--destructive-hover)',
          foreground: 'var(--destructive-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          disabled: 'var(--warning-disabled)',
          light: 'var(--warning-light)',
          foreground: 'var(--warning-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          disabled: 'var(--success-disabled)',
          light: 'var(--success-light)',
          foreground: 'var(--success-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          disabled: 'var(--accent-disabled)',
          light: 'var(--accent-light)',
          foreground: 'var(--accent-foreground)',
        },
        brand: {
          '100': '#EA6365',
          DEFAULT: '#FA7275',
        },
        error: '#b80000',
        green: '#3DD9B3',
        blue: '#56B8FF',
        pink: '#EEA8FD',
        orange: '#F9AB72',
        light: {
          '100': '#333F4E',
          '200': '#A3B2C7',
          '300': '#F2F5F9',
          '400': '#F2F4F8',
        },
        dark: {
          '100': '#04050C',
          '200': '#131524',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        poppins: ['var(--font-poppins)'],
      },
      boxShadow: {
        'drop-1': '0px 10px 30px 0px rgba(66, 71, 97, 0.1)',
        'drop-2': '0 8px 30px 0 rgba(65, 89, 214, 0.3)',
        'drop-3': '0 8px 30px 0 rgba(65, 89, 214, 0.1)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': {
            opacity: '1',
          },
          '20%,50%': {
            opacity: '0',
          },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
export default withUt(config)
