import { formatRelativeTime } from '../../lib/formatters.js';

/**
 * ConversationItem
 *
 * Una fila de la lista de conversaciones: avatar, nombre, producto,
 * último mensaje, tiempo y badge de no leídos.
 */
export function ConversationItem({ conversation, active, onSelect }) {
  const other = conversation.otherUser;
  const name = other?.displayName || other?.username || 'Usuario';
  const preview = conversation.lastMessage || 'Todavía no hay mensajes';

  return (
    <li>
      <button
        type="button"
        className={`conversation-item ${active ? 'conversation-item--active' : ''}`}
        onClick={() => onSelect(conversation.id)}
        aria-current={active ? 'true' : undefined}
      >
        <span className="conversation-item__avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="conversation-item__body">
          <span className="conversation-item__top">
            <span className="conversation-item__name">{name}</span>
            <span className="conversation-item__time">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </span>
          {conversation.productTitle && (
            <span className="conversation-item__product">{conversation.productTitle}</span>
          )}
          <span className="conversation-item__preview">{preview}</span>
        </span>
        {(conversation.unreadCount || 0) > 0 && (
          <span className="conversation-item__badge">{conversation.unreadCount}</span>
        )}
      </button>
    </li>
  );
}
