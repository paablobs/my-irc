import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f2ff' },
          100: { value: '#b3d9ff' },
          200: { value: '#80bfff' },
          300: { value: '#4da6ff' },
          400: { value: '#1a8cff' },
          500: { value: '#0073e6' },
          600: { value: '#005bb5' },
          700: { value: '#004485' },
          800: { value: '#002d55' },
          900: { value: '#001626' },
        },
        dark: {
          50: { value: '#e6e6e6' },
          100: { value: '#b3b3b3' },
          200: { value: '#808080' },
          300: { value: '#4d4d4d' },
          400: { value: '#2d2d3d' },
          500: { value: '#1a1a2e' },
          600: { value: '#16213e' },
          700: { value: '#0f3460' },
          800: { value: '#252545' },
          900: { value: '#0a0a1a' },
        },
      },
      fonts: {
        heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
        body: { value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
        mono: { value: "'JetBrains Mono', 'Fira Code', monospace" },
      },
      radii: {
        sm: { value: '6px' },
        md: { value: '10px' },
        lg: { value: '14px' },
        xl: { value: '20px' },
      },
    },
  },
  globalCss: {
    'html, body': {
      margin: 0,
      padding: 0,
      height: '100%',
    },
    '#root': {
      height: '100%',
    },
  },
});

export const system = createSystem(defaultConfig, config);
