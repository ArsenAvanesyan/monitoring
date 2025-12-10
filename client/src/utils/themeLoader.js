export async function loadTheme(themeName) {
  try {
    const res = await fetch('/theme.json', { cache: 'reload' });
    const themes = await res.json();
    const vars = themes[themeName];

    if (vars) {
      Object.entries(vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });

      document.documentElement.setAttribute('data-theme', themeName);
    }
  } catch (error) {
    console.error('Error loading theme:', error);
  }
}
