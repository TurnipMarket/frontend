import { useEffect, useRef, useState } from 'react';
import { checkAvailability } from './lib/registerClient';

// Estados posibles: 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
export function useAvailability(field, value, { validate, debounceMs = 500 } = {}) {
  const [status, setStatus] = useState('idle');
  const requestId = useRef(0);

  function getInitialStatus(trimmed) {
    if (!trimmed) return 'idle';
    if (validate && !validate(trimmed)) return 'invalid';
    return 'checking';
  }

  function applyResult(result, currentId) {
    if (currentId !== requestId.current) return;
    if (result.available === null) {
      setStatus('idle');
      return;
    }
    setStatus(result.available ? 'available' : 'taken');
  }

  useEffect(() => {
    const trimmed = (value || '').trim();
    const initial = getInitialStatus(trimmed);

    if (initial === 'idle' || initial === 'invalid') {
      setStatus(initial);
      return;
    }

    setStatus('checking');
    const currentId = ++requestId.current;

    const timer = setTimeout(async () => {
      const result = await checkAvailability({ field, value: trimmed });
      applyResult(result, currentId);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [field, value, validate, debounceMs]);

  return status;
}
