import { useCallback } from 'react';
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageRequest,
  startConversation as startConversationRequest,
  markConversationRead,
} from '../lib/chatClient';

export function useChatActions({
  token,
  username,
  conversations,
  setConversations,
  activeIdRef,
  messageRequestRef,
  sendRequestRef,
  setActiveId,
  setMessages,
  setStatus,
  setError,
}) {
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
  }, [token, username, setConversations, setError]);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!token || !conversationId) return false;

      const requestId = ++messageRequestRef.current;

      const requestedConversationId = String(conversationId);

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
    [token, username, activeIdRef, messageRequestRef, setMessages, setStatus, setError]
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
    [loadMessages, token, activeIdRef, messageRequestRef, setActiveId, setMessages, setError, setStatus, setConversations]
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
    [token, username, activeIdRef, sendRequestRef, setError, setMessages, setConversations]
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
    [token, username, loadConversations, openConversation, setError, setConversations]
  );

  return {
    loadConversations,
    loadMessages,
    openConversation,
    send,
    beginConversation,
  };
}
