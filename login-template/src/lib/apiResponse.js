const MESSAGE_KEYS = ['message', 'mensaje', 'error_description'];

/**
 * detailToMessage(detail)
 *
 * Convierte el campo "detail" de una respuesta de error en un mensaje
 * legible. Acepta un string o el array de errores de validación de
 * FastAPI ({ loc, msg, ... }).
 */
function detailToMessage(detail) {
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        const field = Array.isArray(item.loc)
          ? item.loc[item.loc.length - 1]
          : null;

        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .filter(Boolean);

    return parts.length ? parts.join('. ') : null;
  }

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  return null;
}

function firstMessage(raw, keys) {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

export function extractMessage(raw, fallback = null) {
  if (!raw) return fallback;
  return detailToMessage(raw.detail) ?? firstMessage(raw, MESSAGE_KEYS) ?? fallback;
}

// Nombres de campo que el backend puede usar para cada colección,
// tanto en inglés como en español.
const ARRAY_KEYS = {
  products: ['products', 'productos'],
  conversations: ['conversations', 'conversaciones'],
  messages: ['messages', 'mensajes'],
};

/**
 * pickArray(raw, keys)
 *
 * Extrae la colección de una respuesta que puede venir como array
 * plano o envuelta en alguno de los nombres conocidos.
 */
function pickArray(raw, keys) {
  if (Array.isArray(raw)) return raw;

  for (const key of keys) {
    if (Array.isArray(raw?.[key])) return raw[key];
  }

  return [];
}

export function normalizeProducts(raw) {
  return { products: pickArray(raw, ARRAY_KEYS.products) };
}

export function normalizeConversations(raw) {
  return pickArray(raw, ARRAY_KEYS.conversations);
}

export function normalizeMessages(raw) {
  return pickArray(raw, ARRAY_KEYS.messages);
}
