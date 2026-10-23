import { API_BASE_URL, VERIFY_ENDPOINT, MOCK_MODE } from '../config';
import { simulateLatency } from './delay';
import { postJson } from './http';

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

  const result = await postJson(`${API_BASE_URL}${VERIFY_ENDPOINT}`, requestPayload, {
    successMessage: 'Cuenta verificada.',
    failureMessage: 'No pudimos verificar la cuenta.',
  });

  if (!result.ok || !result.data) return result;

  return {
    ...result,
    data: {
      ...result.data,
      token: result.data.token ?? result.data.access_token ?? null,
    },
  };
}
