import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = 'btn icon-btn' }) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'claro' : 'oscuro';
  return (
    <button type="button" className={className} onClick={toggleTheme} aria-label={`Cambiar a tema ${next}`} title={`Tema ${next}`}>
      <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
    </button>
  );
}
