import { useState } from 'react';

export function MessageInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const value = text.trim();

    if (
      !value ||
      disabled ||
      sending ||
      value.length > 1000
    ) {
      return;
    }

    setSending(true);

    try {
      const sent = await onSend(value);

      if (sent) {
        setText('');
      }
    } finally {
      setSending(false);
    }
  }

  const isDisabled = disabled || sending;

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input__field"
        placeholder="Escribí un mensaje…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={isDisabled}
        maxLength={1000}
        aria-label="Mensaje"
      />

      <button
        type="submit"
        className="message-input__send"
        disabled={isDisabled || !text.trim()}
        aria-label="Enviar mensaje"
      >
        {sending ? 'Enviando…' : 'Enviar'}
      </button>
    </form>
  );
}