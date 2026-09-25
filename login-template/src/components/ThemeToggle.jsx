import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 1 0 20.5 14.7Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme();
  const actionLabel = isLight ? 'Activar modo oscuro' : 'Activar modo claro';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={actionLabel}
      aria-pressed={isLight}
      title={actionLabel}
    >
      <span className="theme-toggle__icon">
        {isLight ? <MoonIcon /> : <SunIcon />}
      </span>
      <span className="theme-toggle__label" aria-hidden="true">
        {isLight ? 'Modo claro' : 'Modo oscuro'}
      </span>
    </button>
  );
}
