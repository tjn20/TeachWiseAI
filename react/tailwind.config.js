/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["app/**/*.{js,jsx}", "components/**/*.{js,ts,jsx,tsx}","./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
  	extend: {
  		colors: {
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
				secondaryBorder: 'hsl(var(--secondary-border))'
  			},
			sidebarInset:{
				DEFAULT:'hsl(var(--inset-background))',
				border: 'hsl(var(--inset-border))',
			},
			main: {
				DEFAULT : 'hsl(var(--background))',
				border : 'hsl(var(--secondary-border))'
			},
			muted: {
				foreground: 'hsl(var(--muted-foreground))'
			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"),require('daisyui')],
}

