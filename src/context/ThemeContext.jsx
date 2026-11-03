import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../data/db';

export const THEME_KEY = 'lv_theme';
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

/** Tema claro/oscuro: se guarda en localStorage y se aplica como data-theme en <html>. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => (storage.read(THEME_KEY, 'dark') === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    storage.write(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(current => (current === 'dark' ? 'light' : 'dark'));
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
