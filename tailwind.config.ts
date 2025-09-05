
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
				'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
				'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.015em' }],
				'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.015em' }],
				'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
				'2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0.005em' }],
				'3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '0em' }],
				'4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
				'26': '6.5rem',
				'30': '7.5rem',
				'34': '8.5rem',
				'38': '9.5rem',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Premium color palette
				neon: {
					purple: 'hsl(262, 73%, 75%)',
					blue: 'hsl(196, 89%, 58%)',
					pink: 'hsl(292, 84%, 61%)',
					orange: 'hsl(25, 95%, 53%)',
					green: 'hsl(142, 71%, 45%)',
					cyan: 'hsl(180, 100%, 70%)',
				},
				glass: {
					DEFAULT: 'rgba(255, 255, 255, 0.08)',
					light: 'rgba(255, 255, 255, 0.12)',
					dark: 'rgba(0, 0, 0, 0.08)',
					darker: 'rgba(0, 0, 0, 0.12)',
				},
				premium: {
					50: 'hsl(240, 33%, 97%)',
					100: 'hsl(240, 20%, 95%)',
					200: 'hsl(240, 14%, 90%)',
					300: 'hsl(240, 11%, 83%)',
					400: 'hsl(240, 9%, 69%)',
					500: 'hsl(240, 6%, 50%)',
					600: 'hsl(240, 7%, 40%)',
					700: 'hsl(240, 9%, 32%)',
					800: 'hsl(240, 10%, 24%)',
					900: 'hsl(240, 12%, 16%)',
					950: 'hsl(240, 15%, 9%)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						opacity: '1',
						filter: 'brightness(1)',
					},
					'50%': { 
						opacity: '0.8',
						filter: 'brightness(1.2)',
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 15s ease infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'futuristic-grid': 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
				'glow-purple': 'linear-gradient(45deg, rgba(155, 135, 245, 0.5), rgba(217, 70, 239, 0.2))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			backgroundSize: {
				'grid': '40px 40px',
			},
			boxShadow: {
				'neon': '0 0 20px hsl(262 73% 75% / 0.4)',
				'neon-strong': '0 0 30px hsl(262 73% 75% / 0.6)',
				'premium': '0 1px 3px 0 hsl(240 12% 16% / 0.1), 0 1px 2px -1px hsl(240 12% 16% / 0.1)',
				'premium-lg': '0 4px 6px -1px hsl(240 12% 16% / 0.1), 0 2px 4px -2px hsl(240 12% 16% / 0.1)',
				'premium-xl': '0 10px 15px -3px hsl(240 12% 16% / 0.1), 0 4px 6px -4px hsl(240 12% 16% / 0.1)',
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
				'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.3)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
