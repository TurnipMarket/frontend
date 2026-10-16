import { useEffect, useRef } from 'react';

/**
 * usePolling(callback, { intervalMs, enabled, immediate })
 *
 * Ejecuta `callback` cada `intervalMs` mientras `enabled` sea true.
 * Es el mecanismo de actualización del chat (y de cualquier dato que se
 * quiera refrescar sin WebSocket).
 *
 * El callback se guarda en una ref para que cambiarlo no reinicie el
 * intervalo; solo importan `enabled`, `intervalMs` e `immediate`.
 */
export function usePolling(
  callback,
  { intervalMs = 4000, enabled = true, immediate = true } = {},
) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;
    const tick = () => {
      if (active) saved.current();
    };

    if (immediate) tick();
    const id = setInterval(tick, intervalMs);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [enabled, intervalMs, immediate]);
}
