/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: 'var(--accent-primary)',
          'primary-hover': 'var(--accent-primary-hover)',
          'primary-light': 'var(--accent-primary-light)',
          secondary: 'var(--accent-secondary)',
          'secondary-hover': 'var(--accent-secondary-hover)',
          'secondary-light': 'var(--accent-secondary-light)',
        },
        category: {
          korean: 'var(--category-korean)',
          japanese: 'var(--category-japanese)',
          chinese: 'var(--category-chinese)',
          arabic: 'var(--category-arabic)',
          european: 'var(--category-european)',
          guide: 'var(--category-guide)',
          reference: 'var(--category-reference)',
          editor: 'var(--category-editor)',
        },
        bg: {
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          muted: 'var(--bg-muted)',
          nav: 'var(--bg-nav)',
        },
        border: {
          light: 'var(--border-light)',
          medium: 'var(--border-medium)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      spacing: {
        'nav-height': 'var(--nav-height)',
        'sidebar-width': 'var(--sidebar-width)',
        'content-max-width': 'var(--content-max-width)',
      },
    },
  },
  plugins: [],
}
