export function extractMessage(
  raw,
  fallback = null
) {
  if (!raw) return fallback;

  const detail = raw.detail;

  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        const field = Array.isArray(item.loc)
          ? item.loc[item.loc.length - 1]
          : null;

        return field
          ? `${field}: ${item.msg}`
          : item.msg;
      })
      .filter(Boolean);

    return parts.length
      ? parts.join('. ')
      : fallback;
  }

  if (
    typeof detail === 'string' &&
    detail.trim()
  ) {
    return detail;
  }

  for (const key of [
    'message',
    'mensaje',
    'error_description',
  ]) {
    if (
      typeof raw[key] === 'string' &&
      raw[key].trim()
    ) {
      return raw[key];
    }
  }

  return fallback;
}

export function normalizeProducts(raw) {
  if (Array.isArray(raw)) {
    return { products: raw };
  }

  if (Array.isArray(raw?.products)) {
    return { products: raw.products };
  }

  if (Array.isArray(raw?.productos)) {
    return { products: raw.productos };
  }

  return { products: [] };
}

export function normalizeConversations(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (Array.isArray(raw?.conversations)) {
    return raw.conversations;
  }

  if (Array.isArray(raw?.conversaciones)) {
    return raw.conversaciones;
  }

  return [];
}

export function normalizeMessages(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (Array.isArray(raw?.messages)) {
    return raw.messages;
  }

  if (Array.isArray(raw?.mensajes)) {
    return raw.mensajes;
  }

  return [];
}