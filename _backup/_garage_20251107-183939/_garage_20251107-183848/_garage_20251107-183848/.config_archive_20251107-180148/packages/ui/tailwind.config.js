/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('@repo/tokens/dist/tailwind.preset.cjs')],
  theme: {
    extend: {},
  },
  plugins: [],
};
