/**
 * Helpers para traducir las respuestas del backend real.
 *
 * El backend (FastAPI) no usa un formato uniforme:
 *   - errores de negocio → { "detail": "Email o contraseña incorrectos" }
 *   - errores de validación → { "detail": [ { loc, msg, type }, ... ] }
 *   - algunos endpoints → { "mensaje": "..." } o { "message": "..." }
 *
 * Antes, la UI solo leía `message`, así que con el backend real
 * cualquier error se mostraba como "No pudimos iniciar tu sesión",
 * perdiendo el motivo real. extractMessage() unifica todo eso.
 */

/**
 * extractMessage(raw, fallback)
 *
 * Devuelve un string legible con el error o el mensaje de éxito.
 * Si `raw` no tiene nada reconocible, devuelve `fallback`.
 */
export function extractMessage(raw, fallback = null) {
  if (!raw) return fallback;

  const detail = raw.detail;

  // ValidationError: detail es una lista de problemas por campo.
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        const campo = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : null;
        return campo ? `${campo}: ${item.msg}` : item.msg;
      })
      .filter(Boolean);
    return parts.length ? parts.join('. ') : fallback;
  }

  if (typeof detail === 'string' && detail.trim()) return detail;

  for (const key of ['message', 'mensaje']) {
    if (typeof raw[key] === 'string' && raw[key].trim()) return raw[key];
  }

  return fallback;
}

/**
 * normalizeProducts(raw)
 *
 * El backend devuelve el catálogo como un array plano: []
 * La UI espera { products: [...] }. Esta función acepta las dos
 * formas para que la página no quede vacía cuando haya productos.
 */
export function normalizeProducts(raw) {
  if (Array.isArray(raw)) return { products: raw };
  if (raw && Array.isArray(raw.products)) return { products: raw.products };
  if (raw && Array.isArray(raw.productos)) return { products: raw.productos };
  return { products: [] };
}
