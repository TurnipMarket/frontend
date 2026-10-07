import { API_BASE_URL, LOGIN_ENDPOINT, MOCK_MODE } from '../config';
import { extractMessage } from './apiResponse';

/**
 * loginRequest(payload)
 *
 * Arma el JSON de login y, según el modo:
 *  - MOCK_MODE = true  → no llama a ningún servidor. Simula latencia
 *                        de red y devuelve una respuesta falsa, para
 *                        que puedas probar toda la UI sin backend.
 *  - MOCK_MODE = false → hace un POST real a API_BASE_URL + LOGIN_ENDPOINT.
 *                        Cuando tengas el backend, solo tenés que
 *                        cambiar MOCK_MODE en config.js (o el .env).
 *
 * En ambos casos devuelve { ok, status, data, requestPayload }
 * para que la UI pueda mostrar exactamente qué se envió.
 */
export async function loginRequest({ identifier, password, remember }) {
  const requestPayload = {
    identifier, // email, teléfono o usuario de Discord
    password,
    remember: Boolean(remember),
    client: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'local',
      timestamp: new Date().toISOString(),
    },
  };

  if (MOCK_MODE) {
    await simulateLatency();

    // Reglas mock simples solo para poder ver ambos estados en la demo.
    const isValid = identifier.trim().length > 0 && password.length >= 4;

    if (!isValid) {
      return {
        ok: false,
        status: 401,
        data: { error: 'credenciales_invalidas', message: 'Revisá tu usuario y contraseña.' },
        requestPayload,
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        message: 'Login simulado correctamente (modo mock, sin backend).',
        user: {
          id: 'mock-user-001',
          identifier,
          verified: { email: true, sms: false, discord: false },
        },
        token: 'mock-token.no-es-un-jwt-real',
      },
      requestPayload,
    };
  }

  // ── Modo real: pega al backend cuando exista ──
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      data: { message: 'No se pudo conectar con el servidor.' },
      requestPayload,
    };
  }

  let raw = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  // El backend no documenta el schema de respuesta del login, así que
  // se aceptan los nombres más habituales para no romper el flujo:
  //   token      ← token | access_token
  //   user       ← user | usuario
  // Sin esto, un backend que devuelva access_token dejaría al usuario
  // sin sesión (AuthContext guardaría undefined y el guard de rutas
  // lo expulsaría de vuelta al login).
  const data = raw
    ? {
        ...raw,
        message: extractMessage(raw, response.ok ? 'Sesión iniciada.' : 'No pudimos iniciar tu sesión.'),
        token: raw.token ?? raw.access_token ?? null,
        user: raw.user ?? raw.usuario ?? null,
      }
    : null;

  return { ok: response.ok, status: response.status, data, requestPayload };
}

function simulateLatency() {
  const ms = 550 + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
