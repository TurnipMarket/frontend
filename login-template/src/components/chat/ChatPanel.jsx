import { MessageList } from './MessageList.jsx';
import { MessageInput } from './MessageInput.jsx';

/**
 * ChatPanel
 *
 * Ventana de chat de una conversación: encabezado con el interlocutor,
 * lista de mensajes y caja de envío.
 */
export function ChatPanel({ conversation, messages, status, error, onSend, onBack }) {
  if (!conversation) {
    return (
      <div className="chat-panel chat-panel--empty">
        <span className="chat-panel__icon" aria-hidden="true">💬</span>
        <p>Seleccioná una conversación para empezar a chatear.</p>
      </div>
    );
  }

  const other = conversation.otherUser;
  const otherName = other?.username || 'usuario';

  return (
    <div className="chat-panel">
      <header className="chat-panel__header">
        <button type="button" className="chat-panel__back" onClick={onBack} aria-label="Volver">
          ←
        </button>
        <div className="chat-panel__user">
          <span className="chat-panel__name">@{otherName}</span>
          {conversation.productTitle && (
            <span className="chat-panel__product">{conversation.productTitle}</span>
          )}
        </div>
      </header>

      <MessageList
        messages={messages}
        status={status}
        emptyText={`Iniciá la conversación con @${otherName}.`}
      />

      {error && (
        <p className="chat-panel__error" role="alert">
          {error}
        </p>
      )}

      <MessageInput onSend={onSend} disabled={status === 'loading' && messages.length === 0} />
    </div>
  );
}
