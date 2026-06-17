import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          dark: '#0a0a0f',
          card: '#13131a',
          border: '#1e1e2e',
          accent: '#f59e0b',
          'accent-hover': '#d97706',
          muted: '#6b7280',
          text: '#e5e7eb',
          danger: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
