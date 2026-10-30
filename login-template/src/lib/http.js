import { extractMessage } from './apiResponse';

/**
 * Helpers HTTP compartidos por todos los clientes del backend.
 *
 * Centralizado acá para que los clientes (auth, products, chat) no arman
 * el header de autorización ni repitan el manejo de errores cada uno a
 * su manera.
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
 * Metadata mínima del cliente que se adjunta a las peticiones.
 */
export function originMeta() {
  return {
    client: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'local',
      timestamp: new Date().toISOString(),
    },
  };
}

export function networkError(message = 'No se pudo conectar con el servidor.') {
  return {
    ok: false,
    status: 0,
    data: { error: 'network_error', message },
    offline: true,
  };
}

/**
 * requestJson(url, options)
 *
 * Hace un fetch y normaliza el resultado a { ok, status, data, offline }.
 */
function buildErrorResponse(response, raw) {
  return {
    ok: false,
    status: response.status,
    data: {
      error: raw?.error ?? 'request_failed',
      message: extractMessage(raw, 'El servidor no pudo completar la solicitud.'),
    },
    offline: false,
  };
}

export async function requestJson(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    return networkError();
  }

  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    return buildErrorResponse(response, raw);
  }

  return { ok: true, status: response.status, data: raw, offline: false };
}

/**
 * postJson(url, payload, options)
 *
 * POST genérico con manejo de red, parseo y mensaje por defecto.
 * Devuelve { ok, status, data, requestPayload, offline }.
 */
function buildPostError(payload) {
  return {
    ok: false,
    status: 0,
    data: { message: 'No se pudo conectar con el servidor.' },
    requestPayload: payload,
    offline: true,
  };
}

function buildPostData(raw, response, successMessage, failureMessage) {
  if (!raw) return null;
  return {
    ...raw,
    message: extractMessage(raw, response.ok ? successMessage : failureMessage),
  };
}

export async function postJson(
  url,
  payload,
  { token = null, successMessage = null, failureMessage = null } = {},
) {
  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  } catch {
    return buildPostError(payload);
  }

  const raw = await response.json().catch(() => null);
  const data = buildPostData(raw, response, successMessage, failureMessage);

  return {
    ok: response.ok,
    status: response.status,
    data,
    requestPayload: payload,
    offline: false,
  };
}
