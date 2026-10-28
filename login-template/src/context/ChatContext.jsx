import { createContext, useContext, useMemo } from 'react';

import { useAuth } from './AuthContext';
import { currentUsername } from '../lib/formatters';
import { useChatState } from './useChatState';
import { useChatActions } from './useChatActions';

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

  const {
    conversations,
    setConversations,
    activeId,
    setActiveId,
    messages,
    setMessages,
    status,
    setStatus,
    error,
    setError,
    activeIdRef,
    messageRequestRef,
    sendRequestRef,
  } = useChatState(token);

  const { loadConversations, loadMessages, openConversation, send, beginConversation } =
    useChatActions({
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
    });

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