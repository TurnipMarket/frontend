/**
 * Spinner de carga reutilizable.
 */
export function LoadingSpinner({ message = 'Cargando…' }) {
  return (
    <div className="loading-spinner" role="status">
      <div className="loading-spinner__circle" />
      <p>{message}</p>
    </div>
  );
}
