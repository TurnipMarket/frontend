import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { currentUsername } from '../lib/formatters';
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageRequest,
  startConversation as startConversationRequest,
} from '../lib/chatClient';

const ChatContext = createContext(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

/**
 * ChatProvider
 *
 * Única fuente de verdad del chat: lista de conversaciones, conversación
 * activa y sus mensajes. Toda la comunicación con el backend pasa por
 * chatClient (capa de servicios); los componentes solo leen estado y
 * llaman acciones.
 */
export function ChatProvider({ children }) {
  const { token, user } = useAuth();
  const username = currentUsername(user);

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);

  // Al cerrar sesión se limpia todo, para no mostrar datos de otro usuario.
  useEffect(() => {
    if (token) return;
    setConversations([]);
    setActiveId(null);
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, [token]);

  /**
   * loadConversations()
   *
   * Descarga la lista y la devuelve (además de guardarla en estado),
   * para que beginConversation pueda decidir con datos frescos si ya
   * existe una conversación con ese vendedor.
   */
  const loadConversations = useCallback(async () => {
    if (!token) return [];
    const result = await fetchConversations({ token, username });
    if (result.offline) {
      setError(result.data?.message ?? 'Sin conexión con el servidor.');
      return [];
    }
    if (result.ok) {
      const list = result.data.conversations ?? [];
      setConversations(list);
      return list;
    }
    setError(result.data?.message ?? 'No se pudieron cargar las conversaciones.');
    return [];
  }, [token, username]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setStatus('loading');
    const result = await fetchMessages({ conversationId, token, username });
    if (result.ok) {
      setMessages(result.data.messages ?? []);
      setStatus('ready');
    } else {
      setMessages([]);
      setStatus('error');
      setError(result.data?.message ?? 'No se pudieron cargar los mensajes.');
    }
  }, [token, username]);

  const openConversation = useCallback(async (conversationId) => {
    setActiveId(conversationId);
    setMessages([]);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
    await loadMessages(conversationId);
  }, [loadMessages]);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!activeId || !trimmed) return false;

    const result = await sendMessageRequest({
      conversationId: activeId,
      text: trimmed,
      token,
      username,
    });

    if (result.ok) {
      const message = result.data.message;
      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt }
            : c,
        ),
      );
      return true;
    }

    setError(result.data?.message ?? 'No se pudo enviar el mensaje.');
    return false;
  }, [activeId, token, username]);

  /**
   * beginConversation({ seller, productId, productTitle })
   *
   * Si ya existe una conversación con ese vendedor, la abre; si no, la
   * crea y la abre. Devuelve la conversación (o null si falló).
   */
  const beginConversation = useCallback(async ({ seller, productId = null, productTitle = null }) => {
    if (!seller) return null;

    const list = await loadConversations();
    const existing = list.find((c) => c.seller === seller || c.buyer === seller);
    if (existing) {
      await openConversation(existing.id);
      return existing;
    }

    const result = await startConversationRequest({
      seller,
      productId,
      productTitle,
      token,
      username,
    });

    if (result.ok && result.data.conversation) {
      const conversation = result.data.conversation;
      setConversations((prev) => [conversation, ...prev]);
      await openConversation(conversation.id);
      return conversation;
    }

    setError(result.data?.message ?? 'No se pudo iniciar la conversación.');
    return null;
  }, [loadConversations, openConversation, token, username]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const unreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations],
  );

  const value = {
    conversations,
    activeConversation,
    activeId,
    messages,
    status,
    error,
    unreadCount,
    loadConversations,
    loadMessages,
    openConversation,
    beginConversation,
    send,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
