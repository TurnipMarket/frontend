import { displayName } from '../lib/formatters.js';
import './CreateProductPage.css';

export function CreateProductHeader({ user, onLogout }) {
  return (
    <header className="create-product-card__header">
      <h2>Nuevo producto</h2>
      <p>Completa todos los campos para publicar.</p>
      <p className="create-product-card__session">
        Publicando como <strong>{displayName(user) ?? 'usuario'}</strong>
        <button type="button" onClick={onLogout} className="create-product-card__logout">
          Salir
        </button>
      </p>
    </header>
  );
}
