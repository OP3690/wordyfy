/** @type {import('tailwindcss').Config} */
let typographyPlugin;
try {
  typographyPlugin = require('@tailwindcss/typography');
} catch (_) {
  typographyPlugin = null;
}

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: typographyPlugin ? [typographyPlugin] : [],
}
