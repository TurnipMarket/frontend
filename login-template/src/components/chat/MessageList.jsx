import { useEffect, useRef } from 'react';
import { currentUsername } from '../../lib/formatters.js';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble.jsx';

/**
 * MessageList
 *
 * Lista de mensajes con scroll automático al final cuando llegan nuevos.
 * Muestra un placeholder mientras carga.
 */
export function MessageList({ messages, status, emptyText }) {
  const { user } = useAuth();
  const username = currentUsername(user);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, status]);

  if (status === 'loading' && messages.length === 0) {
    return <div className="message-list message-list--empty">Cargando mensajes…</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <p>{emptyText}</p>
        <p className="message-list__hint">Los mensajes que envíes aparecerán acá.</p>
      </div>
    );
  }

  return (
    <div className="message-list" role="log" aria-live="polite" aria-label="Mensajes">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender === username}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
