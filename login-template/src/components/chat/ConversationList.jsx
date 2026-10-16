import { ConversationItem } from './ConversationItem.jsx';

/**
 * ConversationList
 *
 * Lista lateral de conversaciones con buscador por nombre.
 */
export function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <div className="conversation-list">
      <h2 className="conversation-list__title">Conversaciones</h2>
      {conversations.length === 0 ? (
        <p className="conversation-list__empty">
          Todavía no tenés conversaciones. Iniciá un chat desde un perfil o una publicación.
        </p>
      ) : (
        <ul className="conversation-list__items">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
