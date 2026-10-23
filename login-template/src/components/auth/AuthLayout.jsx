import { AuthBrand } from './AuthBrand.jsx';

/**
 * Estructura de pantalla de autenticación: marca a la izquierda y
 * formulario a la derecha.
 */
export function AuthLayout({ brand, children }) {
  return (
    <div className="login-shell">
      <AuthBrand {...brand} />
      <section className="login-panel">{children}</section>
    </div>
  );
}
