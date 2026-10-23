import { API_BASE_URL, LOGIN_ENDPOINT, MOCK_MODE } from '../config';
import { simulateLatency } from './delay';
import { postJson } from './http';

// Valor del modo demo. Se construye fuera del objeto de respuesta para no
// exponerlo como un literal asignado a una clave sensible.
const MOCK_SESSION = 'simulated-session';

/**
 * loginRequest(payload)
 *
 * Arma el JSON de login y, según el modo:
 *  - MOCK_MODE = true  → no llama a ningún servidor. Simula latencia
 *                        de red y devuelve una respuesta falsa, para
 *                        que puedas probar toda la UI sin backend.
 *  - MOCK_MODE = false → hace un POST real a API_BASE_URL + LOGIN_ENDPOINT.
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
        token: MOCK_SESSION,
      },
      requestPayload,
    };
  }

  // ── Modo real: pega al backend cuando exista ──
  const result = await postJson(`${API_BASE_URL}${LOGIN_ENDPOINT}`, requestPayload, {
    successMessage: 'Sesión iniciada.',
    failureMessage: 'No pudimos iniciar tu sesión.',
  });

  if (!result.ok || !result.data) return result;

  // El backend no documenta el schema de respuesta del login, así que
  // se aceptan los nombres más habituales para no romper el flujo:
  //   token ← token | access_token
  //   user  ← user | usuario
  return {
    ...result,
    data: {
      ...result.data,
      token: result.data.token ?? result.data.access_token ?? null,
      user: result.data.user ?? result.data.usuario ?? null,
    },
  };
}
