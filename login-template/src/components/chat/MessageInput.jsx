import { useState } from 'react';

/**
 * MessageInput
 *
 * Caja de texto para escribir y enviar un mensaje (Enter o botón).
 * No conoce el backend: solo llama a onSend con el texto.
 */
export function MessageInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText('');
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input__field"
        placeholder="Escribí un mensaje…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        maxLength={1000}
        aria-label="Mensaje"
      />
      <button
        type="submit"
        className="message-input__send"
        disabled={disabled || !text.trim()}
        aria-label="Enviar mensaje"
      >
        Enviar
      </button>
    </form>
  );
}
