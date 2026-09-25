import { API_BASE_URL, VERIFY_ENDPOINT, MOCK_MODE } from '../config';

/**
 * verifyCode({ userId, code, channel })
 *
 * Envía el código de verificación al backend para confirmar la cuenta.
 * channel: 'email' | 'sms' | 'discord'
 *
 * MOCK_MODE simula una verificación con códigos fijos.
 */
export async function verifyCode({ userId, code, channel }) {
  const requestPayload = {
    user_id: userId,
    code,
    channel,
    client: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'local',
      timestamp: new Date().toISOString(),
    },
  };

  if (MOCK_MODE) {
    await simulateLatency(600, 1000);

    // En mock, cualquier código de 6 dígitos se acepta
    if (/^\d{6}$/.test(code)) {
      return {
        ok: true,
        status: 200,
        data: {
          message: 'Cuenta verificada (simulada).',
          verified: true,
        },
        requestPayload,
      };
    }

    return {
      ok: false,
      status: 400,
      data: {
        error: 'codigo_invalido',
        message: 'El código ingresado no es válido. Debe ser de 6 dígitos.',
      },
      requestPayload,
    };
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${VERIFY_ENDPOINT}`, {
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

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data, requestPayload };
}

function simulateLatency(min = 400, max = 800) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
