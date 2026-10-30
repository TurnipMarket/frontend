import { API_BASE_URL, CHAT_ENDPOINTS, MOCK_MODE } from '../config';
import {
  normalizeConversations,
  normalizeMessages,
} from './apiResponse';
import { simulateLatency } from './delay';
import { authHeaders, originMeta, requestJson } from './http';
import {
  listConversations,
  listMessages,
  createMessage,
  createConversation,
} from './chatMock';

function normalizeList(items, normalize) {
  return items.map(normalize).filter(Boolean);
}

function hasValidMessageFields(message) {
  const text = message.text ?? message.contenido;
  const sender = message.sender ?? message.senderUsername;
  const createdAt = message.createdAt ?? message.created_at;
  return (
    message.id != null &&
    typeof text === 'string' &&
    typeof sender === 'string' &&
    Boolean(createdAt)
  );
}

function normalizeMessage(message, conversationId) {
  if (!message || typeof message !== 'object') return null;
  if (!hasValidMessageFields(message)) return null;

  const text = message.text ?? message.contenido;
  const sender = message.sender ?? message.senderUsername;
  const createdAt = message.createdAt ?? message.created_at;

  return {
    ...message,
    id: String(message.id),
    conversationId: String(message.conversationId ?? conversationId),
    text,
    sender,
    createdAt,
    read: Boolean(message.read),
  };
}

function normalizeConversation(conversation) {
  if (!conversation || typeof conversation !== 'object') return null;
  if (conversation.id == null) return null;

  const { buyer, seller } = conversation;
  if (typeof buyer !== 'string' || typeof seller !== 'string') {
    return null;
  }

  return {
    ...conversation,
    id: String(conversation.id),
    buyer,
    seller,
    productId: conversation.productId ?? null,
    productTitle: conversation.productTitle ?? null,
    otherUser: conversation.otherUser ?? { username: seller },
    lastMessage: conversation.lastMessage ?? '',
    lastMessageAt: conversation.lastMessageAt ?? null,
    unreadCount: Number(conversation.unreadCount ?? 0),
  };
}

export async function fetchConversations({ token, username }) {
  if (MOCK_MODE) {
    await simulateLatency();
    return {
      ok: true,
      status: 200,
      data: {
        conversations: normalizeList(
          listConversations(username),
          normalizeConversation,
        ),
      },
      offline: false,
    };
  }

  const result = await requestJson(
    `${API_BASE_URL}${CHAT_ENDPOINTS.conversations}`,
    { method: 'GET', headers: authHeaders(token) },
  );

  if (!result.ok) return result;

  return {
    ...result,
    data: {
      conversations: normalizeList(
        normalizeConversations(result.data),
        normalizeConversation,
      ),
    },
  };
}

export async function fetchMessages({ conversationId, token, username }) {
  if (MOCK_MODE) {
    await simulateLatency();
    return {
      ok: true,
      status: 200,
      data: {
        messages: normalizeList(
          listMessages(conversationId, username),
          (message) => normalizeMessage(message, conversationId),
        ),
      },
      offline: false,
    };
  }

  const result = await requestJson(
    `${API_BASE_URL}${CHAT_ENDPOINTS.messages(conversationId)}`,
    { method: 'GET', headers: authHeaders(token) },
  );

  if (!result.ok) return result;

  return {
    ...result,
    data: {
      messages: normalizeList(
        normalizeMessages(result.data),
        (message) => normalizeMessage(message, conversationId),
      ).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    },
  };
}

export async function sendMessage({
  conversationId,
  text,
  token,
  username,
}) {
  const trimmed = text.trim();

  if (!trimmed || trimmed.length > 1000) {
    return {
      ok: false,
      status: 422,
      data: {
        message: 'El mensaje debe tener entre 1 y 1000 caracteres.',
      },
      offline: false,
    };
  }

  const requestPayload = { text: trimmed, ...originMeta() };

  if (MOCK_MODE) {
    await simulateLatency(150, 400);

    const message = normalizeMessage(
      createMessage(conversationId, trimmed, username),
      conversationId,
    );

    if (!message) {
      return {
        ok: false,
        status: 500,
        data: { message: 'El mensaje simulado no es válido.' },
        offline: false,
      };
    }

    return {
      ok: true,
      status: 201,
      data: { message },
      requestPayload,
      offline: false,
    };
  }

  const result = await requestJson(
    `${API_BASE_URL}${CHAT_ENDPOINTS.messages(conversationId)}`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(requestPayload),
    },
  );

  if (!result.ok) return { ...result, requestPayload };

  const message = normalizeMessage(
    result.data?.message ?? result.data?.mensaje,
    conversationId,
  );

  if (!message) {
    return {
      ok: false,
      status: result.status,
      data: {
        message: 'El servidor devolvió un mensaje con formato inválido.',
      },
      requestPayload,
      offline: false,
    };
  }

  return { ...result, data: { message }, requestPayload };
}

export async function startConversation({
  seller,
  productId = null,
  productTitle = null,
  token,
  username,
}) {
  if (!seller || seller === username) {
    return {
      ok: false,
      status: 422,
      data: {
        message: 'No podés iniciar una conversación con vos mismo.',
      },
      offline: false,
    };
  }

  const requestPayload = {
    seller,
    productId,
    productTitle,
    ...originMeta(),
  };

  if (MOCK_MODE) {
    await simulateLatency(250, 500);

    const conversation = normalizeConversation(
      createConversation({
        seller,
        productId,
        productTitle,
        buyer: username,
      }),
    );

    if (!conversation) {
      return {
        ok: false,
        status: 500,
        data: { message: 'No se pudo crear la conversación simulada.' },
        offline: false,
      };
    }

    return {
      ok: true,
      status: 201,
      data: { conversation },
      requestPayload,
      offline: false,
    };
  }

  const result = await requestJson(
    `${API_BASE_URL}${CHAT_ENDPOINTS.conversations}`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(requestPayload),
    },
  );

  if (!result.ok) return { ...result, requestPayload };

  const conversation = normalizeConversation(
    result.data?.conversation ?? result.data?.conversacion,
  );

  if (!conversation) {
    return {
      ok: false,
      status: result.status,
      data: {
        message: 'El servidor devolvió una conversación con formato inválido.',
      },
      requestPayload,
      offline: false,
    };
  }

  return { ...result, data: { conversation }, requestPayload };
}

export async function markConversationRead({ conversationId, token }) {
  if (MOCK_MODE) {
    return {
      ok: true,
      status: 200,
      data: { success: true },
      offline: false,
    };
  }

  return requestJson(
    `${API_BASE_URL}${CHAT_ENDPOINTS.read(conversationId)}`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    },
  );
}
