import { MOCK_MODE } from '../config';
import './CreateProductPage.css';

export function CreateProductDebug({ lastPayload }) {
  if (!MOCK_MODE || !lastPayload) return null;

  return (
    <details className="debug-payload">
      <summary>Ver JSON que se enviaría (modo sin backend)</summary>
      <pre>{JSON.stringify(lastPayload, null, 2)}</pre>
    </details>
  );
}

export function CreateProductMockBanner() {
  if (!MOCK_MODE) return null;

  return (
    <p className="mock-banner">
      Modo sin backend: no se está llamando a ningún servidor. Editá{' '}
      <code>MOCK_MODE</code> en <code>src/config.js</code> cuando conectes el real.
    </p>
  );
}
