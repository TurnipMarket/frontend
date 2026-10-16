import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import { currentUsername } from '../lib/formatters';

import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageRequest,
  startConversation as startConversationRequest,
  markConversationRead,
} from '../lib/chatClient';

const ChatContext = createContext(null);

export function useChat() {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error('useChat must be used within ChatProvider');
  }

  return ctx;
}

export function ChatProvider({ children }) {
  const { token, user } = useAuth();
  const username = currentUsername(user);

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const activeIdRef = useRef(null);
  const messageRequestRef = useRef(0);
  const sendRequestRef = useRef(false);

  useEffect(() => {
    if (token) return;

    activeIdRef.current = null;
    messageRequestRef.current += 1;
    sendRequestRef.current = false;

    setConversations([]);
    setActiveId(null);
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, [token]);

  const loadConversations = useCallback(async () => {
    if (!token) return [];

    const result = await fetchConversations({ token, username });

    if (!result.ok) {
      setError(
        result.data?.message ??
          'No se pudieron cargar las conversaciones.'
      );
      return [];
    }

    const list = result.data?.conversations ?? [];

    setConversations(list);

    return list;
  }, [token, username]);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!token || !conversationId) return false;

      // Cada petición recibe un número único.
      const requestId = ++messageRequestRef.current;

      const requestedConversationId = String(conversationId);

      // No mostrar mensajes de una conversación que ya no está activa.
      if (
        activeIdRef.current != null &&
        String(activeIdRef.current) !== requestedConversationId
      ) {
        return false;
      }

      const result = await fetchMessages({
        conversationId: requestedConversationId,
        token,
        username,
      });

      // Si el usuario cambió de conversación mientras esperábamos,
      // ignoramos el resultado viejo.
      if (
        requestId !== messageRequestRef.current ||
        String(activeIdRef.current) !== requestedConversationId
      ) {
        return false;
      }

      if (!result.ok) {
        setStatus('error');
        setError(
          result.data?.message ??
            'No se pudieron cargar los mensajes.'
        );
        return false;
      }

      setMessages(result.data?.messages ?? []);
      setStatus('ready');
      setError(null);

      return true;
    },
    [token, username]
  );

  const openConversation = useCallback(
    async (conversationId) => {
      if (!conversationId) return false;

      const id = String(conversationId);

      activeIdRef.current = id;
      messageRequestRef.current += 1;

      setActiveId(id);
      setMessages([]);
      setError(null);
      setStatus('loading');

      setConversations((previous) =>
        previous.map((conversation) =>
          String(conversation.id) === id
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      );

      const loaded = await loadMessages(id);

      if (loaded && token) {
        const readResult = await markConversationRead({
          conversationId: id,
          token,
        });

        if (!readResult.ok) {
          setError(
            readResult.data?.message ??
              'Los mensajes se cargaron, pero no se pudo actualizar su lectura.'
          );
        }
      }

      return loaded;
    },
    [loadMessages, token]
  );

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim();
      const conversationId = activeIdRef.current;

      if (
        !token ||
        !conversationId ||
        !trimmed ||
        trimmed.length > 1000 ||
        sendRequestRef.current
      ) {
        return false;
      }

      sendRequestRef.current = true;
      setError(null);

      try {
        const result = await sendMessageRequest({
          conversationId,
          text: trimmed,
          token,
          username,
        });

        if (!result.ok) {
          setError(
            result.data?.message ?? 'No se pudo enviar el mensaje.'
          );
          return false;
        }

        const message = result.data?.message;

        if (!message) {
          setError('El servidor no devolvió el mensaje creado.');
          return false;
        }

        // No agregamos el mensaje a otra conversación si el usuario
        // cambió de chat mientras se enviaba.
        if (
          String(activeIdRef.current) !== String(conversationId)
        ) {
          return true;
        }

        setMessages((previous) => {
          const exists = previous.some(
            (item) => String(item.id) === String(message.id)
          );

          if (exists) return previous;

          return [...previous, message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );
        });

        setConversations((previous) =>
          previous.map((conversation) =>
            String(conversation.id) === String(conversationId)
              ? {
                  ...conversation,
                  lastMessage: message.text,
                  lastMessageAt: message.createdAt,
                }
              : conversation
          )
        );

        return true;
      } catch {
        setError('Ocurrió un error inesperado al enviar el mensaje.');
        return false;
      } finally {
        sendRequestRef.current = false;
      }
    },
    [token, username]
  );

  const beginConversation = useCallback(
    async ({
      seller,
      productId = null,
      productTitle = null,
    }) => {
      if (!token || !seller || seller === username) {
        setError('No se puede iniciar esta conversación.');
        return null;
      }

      setError(null);

      const list = await loadConversations();

      // Una conversación pertenece a una pareja de usuarios y a un
      // producto concreto. Si no hay producto, es un chat general.
      const existing = list.find((conversation) => {
        const peopleMatch =
          (conversation.buyer === username &&
            conversation.seller === seller) ||
          (conversation.seller === username &&
            conversation.buyer === seller);

        const productMatches =
          productId == null
            ? conversation.productId == null
            : String(conversation.productId) === String(productId);

        return peopleMatch && productMatches;
      });

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

      if (!result.ok || !result.data?.conversation) {
        setError(
          result.data?.message ??
            'No se pudo iniciar la conversación.'
        );
        return null;
      }

      const conversation = result.data.conversation;

      setConversations((previous) => {
        const exists = previous.some(
          (item) =>
            String(item.id) === String(conversation.id)
        );

        if (exists) return previous;

        return [conversation, ...previous];
      });

      await openConversation(conversation.id);

      return conversation;
    },
    [token, username, loadConversations, openConversation]
  );

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          String(conversation.id) === String(activeId)
      ) ?? null,
    [conversations, activeId]
  );

  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total + Number(conversation.unreadCount || 0),
        0
      ),
    [conversations]
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

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}