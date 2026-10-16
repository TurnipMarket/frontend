// ─────────────────────────────────────────────────────────────
// STORE MOCK DE CHAT
//
// Solo se usa cuando MOCK_MODE = true. Mantiene las conversaciones y
// los mensajes en memoria (no persiste entre recargas, igual que el resto
// de los datos mock de la app) para poder probar toda la UI sin backend.
//
// El store se siembra en torno al username del usuario logueado, así las
// conversaciones "pertenecen" a quien está usando la demo.
// ─────────────────────────────────────────────────────────────

let state = null;

/** userDisplayName(username) → "atlas_running" → "Atlas Running". */
function userDisplayName(username) {
  if (!username) return 'Usuario';
  return String(username)
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function minutesAgo(now, minutes) {
  return new Date(now - minutes * 60 * 1000).toISOString();
}

/**
 * buildMockState(username)
 *
 * Crea el estado inicial: tres conversaciones de ejemplo que cubren los
 * dos roles (el usuario como comprador y como vendedor) y sus mensajes.
 */
function buildMockState(username) {
  const now = Date.now();
  const conversations = [
    {
      id: 'conv_demo_1',
      productId: 'p001',
      productTitle: 'Zapatos Atlas Runner',
      productImage: null,
      buyer: username,
      seller: 'atlas_running',
      otherUser: { username: 'atlas_running', displayName: userDisplayName('atlas_running') },
      lastMessage: 'Exacto, talle 42. Te lo reservo hasta el viernes.',
      lastMessageAt: minutesAgo(now, 35),
      unreadCount: 0,
    },
    {
      id: 'conv_demo_2',
      productId: 'p002',
      productTitle: 'Mochila Trail 40L',
      productImage: null,
      buyer: username,
      seller: 'outdoor_pro',
      otherUser: { username: 'outdoor_pro', displayName: userDisplayName('outdoor_pro') },
      lastMessage: 'Avisame y te la separo 😊',
      lastMessageAt: minutesAgo(now, 285),
      unreadCount: 2,
    },
    {
      id: 'conv_demo_3',
      productId: 'p003',
      productTitle: 'Auriculares NovaBass',
      productImage: null,
      buyer: 'techstore',
      seller: username,
      otherUser: { username: 'techstore', displayName: userDisplayName('techstore') },
      lastMessage: '¿Aceptás transferencia?',
      lastMessageAt: minutesAgo(now, 1555),
      unreadCount: 1,
    },
  ];

  const messages = {
    conv_demo_1: [
      { id: 'msg_1_1', conversationId: 'conv_demo_1', sender: 'atlas_running', text: '¡Hola! Sí, todavía están disponibles.', createdAt: minutesAgo(now, 50), read: true },
      { id: 'msg_1_2', conversationId: 'conv_demo_1', sender: username, text: 'Genial, ¿el talle es 42?', createdAt: minutesAgo(now, 45), read: true },
      { id: 'msg_1_3', conversationId: 'conv_demo_1', sender: 'atlas_running', text: 'Exacto, talle 42. Te lo reservo hasta el viernes.', createdAt: minutesAgo(now, 35), read: true },
    ],
    conv_demo_2: [
      { id: 'msg_2_1', conversationId: 'conv_demo_2', sender: username, text: 'Hola, ¿tenés stock?', createdAt: minutesAgo(now, 300), read: true },
      { id: 'msg_2_2', conversationId: 'conv_demo_2', sender: 'outdoor_pro', text: 'Sí, quedan dos. ¿Te interesa?', createdAt: minutesAgo(now, 290), read: false },
      { id: 'msg_2_3', conversationId: 'conv_demo_2', sender: 'outdoor_pro', text: 'Avisame y te la separo 😊', createdAt: minutesAgo(now, 285), read: false },
    ],
    conv_demo_3: [
      { id: 'msg_3_1', conversationId: 'conv_demo_3', sender: 'techstore', text: 'Buenas, vi tu publicación del auricular.', createdAt: minutesAgo(now, 1560), read: false },
      { id: 'msg_3_2', conversationId: 'conv_demo_3', sender: 'techstore', text: '¿Aceptás transferencia?', createdAt: minutesAgo(now, 1555), read: false },
    ],
  };

  return { username, conversations, messages };
}

/** getState(username) → estado lazy, re-sembrado si cambia el usuario. */
function getState(username) {
  if (!state || state.username !== username) {
    state = buildMockState(username);
  }
  return state;
}

function clone(conversations) {
  return conversations.map((c) => ({ ...c, otherUser: { ...c.otherUser } }));
}

/**
 * listConversations(username)
 *
 * Devuelve las conversaciones del usuario, la más reciente primero.
 */
export function listConversations(username) {
  return clone(getState(username).conversations).sort(
    (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
  );
}

/**
 * listMessages(conversationId, username)
 *
 * Devuelve los mensajes de una conversación, en orden cronológico.
 */
export function listMessages(conversationId, username) {
  const messages = getState(username).messages[conversationId];
  return messages ? messages.map((m) => ({ ...m })) : [];
}

/**
 * createMessage(conversationId, text, username)
 *
 * Agrega un mensaje enviado por el usuario y actualiza el resumen de la
 * conversación. Devuelve el mensaje creado (o null si no existe la sala).
 */
export function createMessage(conversationId, text, username) {
  const current = getState(username);
  const conversation = current.conversations.find((c) => c.id === conversationId);
  if (!conversation) return null;

  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    conversationId,
    sender: username,
    text,
    createdAt: new Date().toISOString(),
    read: true,
  };

  current.messages[conversationId] = [...(current.messages[conversationId] ?? []), message];
  conversation.lastMessage = text;
  conversation.lastMessageAt = message.createdAt;
  return { ...message };
}

/**
 * createConversation({ seller, productId, productTitle, buyer })
 *
 * Busca una conversación existente entre el comprador y el vendedor; si no
 * hay, crea una nueva (sin mensajes). Devuelve la conversación.
 */
export function createConversation({ seller, productId = null, productTitle = null, buyer }) {
  const current = getState(buyer);
  const existing = current.conversations.find(
    (c) => c.seller === seller || c.buyer === seller,
  );
  if (existing) return { ...existing };

  const conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId,
    productTitle,
    productImage: null,
    buyer,
    seller,
    otherUser: { username: seller, displayName: userDisplayName(seller) },
    lastMessage: null,
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
  };

  current.conversations.unshift(conversation);
  current.messages[conversation.id] = [];
  return { ...conversation };
}

/**
 * markConversationRead(conversationId, username)
 *
 * Marca los mensajes de una conversación como leídos.
 */
export function markConversationRead(conversationId, username) {
  const current = getState(username);
  const conversation = current.conversations.find((c) => c.id === conversationId);
  if (!conversation) return;
  conversation.unreadCount = 0;
  current.messages[conversationId] = (current.messages[conversationId] ?? []).map((m) => ({
    ...m,
    read: true,
  }));
}

/** clearMockChat() → usado por los tests para aislar casos. */
export function clearMockChat() {
  state = null;
}
