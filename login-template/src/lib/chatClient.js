import { API_BASE_URL, CHAT_ENDPOINTS, MOCK_MODE } from '../config';
import { extractMessage, normalizeConversations, normalizeMessages } from './apiResponse';
import { authHeaders, originMeta } from './http';
import {
  listConversations,
  listMessages,
  createMessage,
  createConversation,
} from './chatMock';

/**
 * Cliente de chat.
 *
 * Sigue el mismo contrato que productClient: cada función devuelve
 * { ok, status, data, offline } (y a veces requestPayload), de modo que
 * la UI nunca tiene que saber si está hablando con el backend real o
 * con los datos simulados.
 *
 * Los endpoints esperados del backend real:
 *   GET    /api/conversations                         → lista de conversaciones
 *   POST   /api/conversations                         → crea/encuentra una conversación
 *   GET    /api/conversations/:id/messages            → mensajes de una conversación
 *   POST   /api/conversations/:id/messages            → envía un mensaje
 */

function simulateLatency(min = 250, max = 600) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function offlineResult(message = 'No se pudo conectar con el servidor.') {
  return { ok: false, status: 0, data: { error: 'network_error', message }, offline: true };
}

/**
 * fetchConversations({ token, username })
 *
 * Lista las conversaciones del usuario autenticado.
 */
export async function fetchConversations({ token, username }) {
  if (MOCK_MODE) {
    await simulateLatency();
    return {
      ok: true,
      status: 200,
      data: { conversations: listConversations(username) },
      offline: false,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.conversations}`, {
      method: 'GET',
      headers: authHeaders(token),
    });
    const raw = await response.json().catch(() => null);
    const data = response.ok
      ? { conversations: normalizeConversations(raw) }
      : { message: extractMessage(raw, 'No se pudieron cargar las conversaciones.') };
    return { ok: response.ok, status: response.status, data, offline: false };
  } catch {
    return offlineResult();
  }
}

/**
 * fetchMessages({ conversationId, token, username })
 *
 * Lista los mensajes de una conversación, en orden cronológico.
 */
export async function fetchMessages({ conversationId, token, username }) {
  if (MOCK_MODE) {
    await simulateLatency();
    return {
      ok: true,
      status: 200,
      data: { messages: listMessages(conversationId, username) },
      offline: false,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.messages(conversationId)}`, {
      method: 'GET',
      headers: authHeaders(token),
    });
    const raw = await response.json().catch(() => null);
    const data = response.ok
      ? { messages: normalizeMessages(raw) }
      : { message: extractMessage(raw, 'No se pudieron cargar los mensajes.') };
    return { ok: response.ok, status: response.status, data, offline: false };
  } catch {
    return offlineResult();
  }
}

/**
 * sendMessage({ conversationId, text, token, username })
 *
 * Envía un mensaje a una conversación existente.
 */
export async function sendMessage({ conversationId, text, token, username }) {
  const requestPayload = { text, ...originMeta() };

  if (MOCK_MODE) {
    await simulateLatency(150, 400);
    const message = createMessage(conversationId, text, username);
    return { ok: true, status: 201, data: { message }, requestPayload };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.messages(conversationId)}`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(requestPayload),
    });
    const raw = await response.json().catch(() => null);
    const data = raw
      ? { ...raw, message: raw.message ?? raw.mensaje ?? null }
      : { message: extractMessage(raw, 'No se pudo enviar el mensaje.') };
    return { ok: response.ok, status: response.status, data, requestPayload };
  } catch {
    return offlineResult();
  }
}

/**
 * startConversation({ seller, productId, productTitle, token, username })
 *
 * Busca (o crea) la conversación entre el usuario actual y un vendedor.
 * Devuelve { conversation }.
 */
export async function startConversation({
  seller,
  productId = null,
  productTitle = null,
  token,
  username,
}) {
  const requestPayload = { seller, productId, productTitle, ...originMeta() };

  if (MOCK_MODE) {
    await simulateLatency(250, 500);
    const conversation = createConversation({
      seller,
      productId,
      productTitle,
      buyer: username,
    });
    return { ok: true, status: 201, data: { conversation }, requestPayload };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.conversations}`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(requestPayload),
    });
    const raw = await response.json().catch(() => null);
    const data = raw
      ? { ...raw, conversation: raw.conversation ?? raw.conversacion ?? null }
      : { message: extractMessage(raw, 'No se pudo iniciar la conversación.') };
    return { ok: response.ok, status: response.status, data, requestPayload };
  } catch {
    return offlineResult();
  }
}
