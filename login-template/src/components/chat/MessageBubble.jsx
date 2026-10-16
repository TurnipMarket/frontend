import { formatTime } from '../../lib/formatters.js';

/**
 * MessageBubble
 *
 * Una burbuja de mensaje. Las propias (enviadas por el usuario) se
 * alinean a la derecha con el color de acento; las demás, a la izquierda.
 */
export function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message ${isOwn ? 'message--own' : 'message--other'}`}>
      <div className="message__bubble">
        <p className="message__text">{message.text}</p>
        <time className="message__time" dateTime={message.createdAt}>
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
