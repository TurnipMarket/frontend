const MESSAGES = {
  checking: 'Comprobando…',
  available: 'Disponible',
  taken: 'Ya está en uso',
  invalid: 'Formato inválido',
};

export default function AvailabilityStatus({ status }) {
  if (status === 'idle' || !status) return null;

  return (
    <span className={`availability availability--${status}`} role="status">
      {status === 'checking' && <span className="availability__spinner" aria-hidden="true" />}
      {MESSAGES[status]}
    </span>
  );
}
