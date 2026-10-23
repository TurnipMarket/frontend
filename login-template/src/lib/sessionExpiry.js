// Si el backend no manda vencimiento, la sesión se considera
// válida por 30 días. Es tiempo suficiente para "recordarme" y
// finito para que una sesión abandonada no viva para siempre.
export const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * toAbsoluteTime(value)
 *
 * Normaliza una marca de tiempo absoluta (número o ISO) a milisegundos.
 * Devuelve null si no es un valor reconocible.
 */
function toAbsoluteTime(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Unix en segundos (~1.7e9) vs. Unix en milisegundos (~1.7e12).
    // Sin esta corrección, un timestamp en segundos se leería como
    // 1970 y la sesión se vencería al instante.
    return value < 1e12 ? value * 1000 : value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

/**
 * resolveExpiry(response)
 *
 * Interpreta la expiración que devuelve el backend. Acepta los
 * nombres más habituales, distinguiendo absolutos de relativos:
 *
 *   expiresAt / expires_at → marca de tiempo absoluta (ms o ISO)
 *   expiresIn / expires_in → segundos de validez desde ahora
 *
 * Si el backend no manda ninguna, cae en el TTL por defecto.
 */
export function resolveExpiry(response) {
  const absolute = toAbsoluteTime(response?.expiresAt ?? response?.expires_at);
  if (absolute != null) return absolute;

  const relative = response?.expiresIn ?? response?.expires_in;
  if (typeof relative === 'number' && Number.isFinite(relative) && relative > 0) {
    return Date.now() + relative * 1000;
  }

  return Date.now() + DEFAULT_TTL_MS;
}
