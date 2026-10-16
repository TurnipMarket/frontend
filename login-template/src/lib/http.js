/**
 * Helpers HTTP compartidos por todos los clientes del backend.
 *
 * Centralizado acá para que los clientes (auth, products, chat) no arman
 * el header de autorización cada uno a su manera.
 */

/**
 * authHeaders(token)
 *
 * Arma los headers de una petición autenticada. Si hay token, lo manda
 * como Authorization: Bearer; si no, devuelve solo el Content-Type,
 * para no enviar un header vacío que el backend pueda rechazar.
 */
export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * originMeta()
 *
 * Metadata mínima del cliente que se adjunta a las peticiones, igual que
 * hacen authClient y createProductClient.
 */
export function originMeta() {
  return {
    client: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'local',
      timestamp: new Date().toISOString(),
    },
  };
}
