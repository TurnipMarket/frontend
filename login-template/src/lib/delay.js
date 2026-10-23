/**
 * Simula la latencia de red en modo mock.
 * Centralizada acá para que todos los clientes usen la misma espera.
 */
export function simulateLatency(min = 300, max = 800) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
