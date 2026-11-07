module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        primary: '#164e63',
        'primary-foreground': '#ffffff',
        muted: '#e2e8f0',
        'muted-foreground': '#475569',
        border: '#cbd5e1',
        destructive: '#991b1b',
      },
    },
  },
  plugins: [],
};
