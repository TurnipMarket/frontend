import { useEffect, useRef, useState } from 'react';
import { checkAvailability } from './lib/registerClient';

// Estados posibles: 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
export function useAvailability(field, value, { validate, debounceMs = 500 } = {}) {
  const [status, setStatus] = useState('idle');
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = (value || '').trim();

    if (!trimmed) {
      setStatus('idle');
      return;
    }

    if (validate && !validate(trimmed)) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');
    const currentId = ++requestId.current;

    const timer = setTimeout(async () => {
      const result = await checkAvailability({ field, value: trimmed });
      if (currentId !== requestId.current) return; // llegó una respuesta vieja, se ignora

      if (result.available === null) {
        setStatus('idle');
      } else {
        setStatus(result.available ? 'available' : 'taken');
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [field, value, validate, debounceMs]);

  return status;
}
