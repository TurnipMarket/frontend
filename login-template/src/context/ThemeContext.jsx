import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY_THEME = 'cv_theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

function isValidTheme(value) {
  return value === DARK_THEME || value === LIGHT_THEME;
}

function getThemeStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getInitialTheme() {
  const storage = getThemeStorage();
  if (!storage) return DARK_THEME;

  try {
    const storedTheme = storage.getItem(STORAGE_KEY_THEME);
    return isValidTheme(storedTheme) ? storedTheme : DARK_THEME;
  } catch {
    return DARK_THEME;
  }
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute('content', theme === LIGHT_THEME ? '#f4f6fa' : '#10131A');
  }
}

function persistTheme(theme) {
  const storage = getThemeStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY_THEME, theme);
  } catch {
    return;
  }
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    persistTheme(theme);

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY_THEME) return;
      setTheme(isValidTheme(event.newValue) ? event.newValue : DARK_THEME);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLight: theme === LIGHT_THEME,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
