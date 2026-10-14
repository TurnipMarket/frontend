import { MOCK_MODE } from '../../config.js';

/**
 * Banner de estado offline reutilizable.
 */
export function OfflineBanner() {
  return (
    <div className="offline-banner" role="alert">
      <span className="offline-banner__icon" aria-hidden="true">⚠</span>
      <div className="offline-banner__text">
        <strong>Sin conexión con el servidor</strong>
        <p>
          No se pudieron cargar los productos porque el backend no está disponible.
          {MOCK_MODE && ' Estás en modo demo (sin servidor).'}
        </p>
      </div>
    </div>
  );
}
