import { useState, useRef, useEffect } from 'react';

export function useChatState(token) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const activeIdRef = useRef(null);
  const messageRequestRef = useRef(0);
  const sendRequestRef = useRef(false);

  useEffect(() => {
    if (token) return;

    activeIdRef.current = null;
    messageRequestRef.current += 1;
    sendRequestRef.current = false;

    setConversations([]);
    setActiveId(null);
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, [token]);

  return {
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
  };
}
