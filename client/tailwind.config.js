import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1401px',
      '2xl': '1575px',
      '3xl': '1780px',
    },
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        neutral: 'var(--neutral)',
        'base-100': 'var(--base-100)',
        'base-200': 'var(--base-200)',
        'base-300': 'var(--base-300)',
        info: 'var(--info)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      borderRadius: {
        sm: 'var(--rounded-sm)',
        md: 'var(--rounded-md)',
        lg: 'var(--rounded-lg)',
        xl: 'var(--rounded-xl)',
      },
      borderWidth: {
        btn: 'var(--border-width-btn)',
        input: 'var(--border-width-input)',
        checkbox: 'var(--border-width-checkbox)',
        range: 'var(--border-width-range)',
        menu: 'var(--border-width-menu)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: false, // Отключаем DaisyUI темы, используем только свои переменные
    darkTheme: 'monDark',
  },
};
