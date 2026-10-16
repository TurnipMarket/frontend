import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { usePolling } from '../hooks/usePolling';
import { CHAT_POLL_MS } from '../config';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { ConversationList } from '../components/chat/ConversationList.jsx';
import { ChatPanel } from '../components/chat/ChatPanel.jsx';
import './MessagesPage.css';

/**
 * readChatQuery()
 *
 * Lee el producto opcional que vino en la URL al abrir el chat desde una
 * publicación (#/mensajes/:vendedor?productId=...&productTitle=...).
 */
function readChatQuery() {
  const hash = window.location.hash;
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  const params = new URLSearchParams(query);
  const productId = params.get('productId');
  const productTitle = params.get('productTitle');
  return productId || productTitle ? { productId, productTitle } : null;
}

export default function MessagesPage({ username }) {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    conversations,
    activeConversation,
    activeId,
    messages,
    status,
    error,
    loadConversations,
    loadMessages,
    openConversation,
    beginConversation,
    send,
  } = useChat();
  const [showChat, setShowChat] = useState(Boolean(username));

  const product = useMemo(readChatQuery, []);

  // Carga inicial de la lista (y polling para mantenerla al día).
  usePolling(loadConversations, { intervalMs: CHAT_POLL_MS, enabled: isAuthenticated });

  // Si la URL trae un vendedor, abre (o crea) la conversación una sola vez.
  useEffect(() => {
    if (!username || !isAuthenticated) return undefined;
    let cancelled = false;
    beginConversation({
      seller: username,
      productId: product?.productId ?? null,
      productTitle: product?.productTitle ?? null,
    }).then((conversation) => {
      if (!cancelled && conversation) setShowChat(true);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, isAuthenticated]);

  // Polling de los mensajes de la conversación activa.
  usePolling(
    () => { if (activeId) loadMessages(activeId); },
    { intervalMs: CHAT_POLL_MS, enabled: isAuthenticated && Boolean(activeId) },
  );

  function handleSelect(conversationId) {
    openConversation(conversationId);
    setShowChat(true);
  }

  return (
    <div className="messages">
      <Header user={user} isAuthenticated={isAuthenticated} logout={logout} />

      <main className={`messages__main ${showChat ? 'messages__main--chat-open' : ''}`}>
        <aside className="messages__sidebar">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </aside>
        <section className="messages__panel">
          <ChatPanel
            conversation={activeConversation}
            messages={messages}
            status={status}
            error={error}
            onSend={send}
            onBack={() => setShowChat(false)}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
