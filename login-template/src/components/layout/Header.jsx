import SealMark from '../SealMark.jsx';
import { displayName } from '../../lib/formatters.js';

/**
 * Header reutilizable para todas las páginas.
 */
export function Header({ user, isAuthenticated, logout, showCreateButton = true }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <a href="#/" className="app-header__logo">
          <SealMark size={40} />
          <span className="app-header__brand">Contactos Verificados</span>
        </a>
        <nav className="app-header__nav">
          {isAuthenticated ? (
            <>
              <span className="app-header__nav-user">
                Hola, {displayName(user) ?? 'usuario'}
              </span>
              {showCreateButton && (
                <a href="#/crear-producto" className="app-header__nav-link app-header__nav-link--accent">
                  + Publicar producto
                </a>
              )}
              <button type="button" className="app-header__nav-link app-header__nav-link--btn" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <a href="#/login" className="app-header__nav-link">Iniciar sesión</a>
              <a href="#/registro" className="app-header__nav-link app-header__nav-link--accent">Registrarse</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
