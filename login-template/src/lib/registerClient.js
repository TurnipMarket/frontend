import {
  API_BASE_URL,
  REGISTER_ENDPOINT,
  AVAILABILITY_ENDPOINT,
  MOCK_MODE,
  MOCK_TAKEN_USERNAMES,
  MOCK_TAKEN_EMAILS,
  MOCK_TAKEN_PHONES,
} from '../config';

/**
 * checkAvailability({ field, value })
 *
 * Chequea si un username/email/teléfono ya está en uso.
 * field: 'username' | 'email' | 'phone'
 *
 * ⚠️ La unicidad REAL solo la puede garantizar el backend (es el único
 * que ve toda la base de usuarios). Acá solo simulamos el resultado
 * contra listas fijas en config.js para poder probar la UI.
 * Cuando MOCK_MODE=false, esto pega a AVAILABILITY_ENDPOINT.
 */
export async function checkAvailability({ field, value }) {
  if (!value || !value.trim()) {
    return { ok: true, available: null };
  }

  if (MOCK_MODE) {
    await simulateLatency(300, 600);
    const normalized = value.trim().toLowerCase();

    const taken =
      (field === 'username' && MOCK_TAKEN_USERNAMES.includes(normalized)) ||
      (field === 'email' && MOCK_TAKEN_EMAILS.includes(normalized)) ||
      (field === 'phone' && MOCK_TAKEN_PHONES.includes(value.trim()));

    return { ok: true, available: !taken };
  }

  const params = new URLSearchParams({ field, value });
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${AVAILABILITY_ENDPOINT}?${params}`);
  } catch {
    return { ok: false, available: null };
  }
  const data = await response.json().catch(() => null);
  return { ok: response.ok, available: data?.available ?? null };
}

/**
 * registerRequest(payload)
 *
 * Arma el JSON de registro. En mock mode no llama a ningún servidor:
 * revalida unicidad contra las listas mock y devuelve una respuesta
 * simulada. Cuando MOCK_MODE=false, hace POST real a REGISTER_ENDPOINT.
 */
export async function registerRequest({ username, email, phone, password, verifyBy }) {
  const requestPayload = {
    username,
    email: email || null,
    phone: phone || null,
    password,
    verifyBy, // 'email' | 'sms' | 'discord' -> canal elegido para verificar
    client: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'local',
      timestamp: new Date().toISOString(),
    },
  };

  if (MOCK_MODE) {
    await simulateLatency(600, 1000);

    const normalizedUser = username.trim().toLowerCase();
    if (MOCK_TAKEN_USERNAMES.includes(normalizedUser)) {
      return {
        ok: false,
        status: 409,
        data: { error: 'username_tomado', message: 'Ese nombre de usuario ya está en uso.' },
        requestPayload,
      };
    }

    return {
      ok: true,
      status: 201,
      data: {
        message: 'Cuenta creada (simulada, sin backend). Falta verificar el contacto elegido.',
        user: {
          id: 'mock-user-002',
          username,
          email: email || null,
          phone: phone || null,
          verified: false,
        },
      },
      requestPayload,
    };
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });
  } catch (err) {
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

  const data = raw
    ? {
        message: raw.mensaje ?? raw.message ?? null,
        user: raw.usuario_id
          ? { id: raw.usuario_id, username: raw.username, email, phone, verificado: raw.verificado }
          : raw.user ?? null,
        token: raw.token ?? null,
        verifyBy: raw.verifyBy ?? requestPayload.verifyBy,
      }
    : null;

  return { ok: response.ok, status: response.status, data, requestPayload };
}

function simulateLatency(min = 400, max = 800) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
