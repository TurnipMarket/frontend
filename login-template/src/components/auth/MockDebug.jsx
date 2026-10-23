import { MOCK_MODE } from '../../config';

/**
 * MockPayload
 *
 * Muestra el JSON que se enviaría en modo demo. Solo se renderiza en
 * MOCK_MODE y cuando hay payload.
 */
export function MockPayload({ payload, summary }) {
  if (!MOCK_MODE || !payload) return null;

  return (
    <details className="debug-payload">
      <summary>{summary}</summary>
      <pre>{JSON.stringify(payload, null, 2)}</pre>
    </details>
  );
}

/**
 * MockBanner
 *
 * Aviso de modo demo. Solo se renderiza en MOCK_MODE.
 */
export function MockBanner({ children }) {
  if (!MOCK_MODE) return null;

  return <p className="mock-banner">{children}</p>;
}
