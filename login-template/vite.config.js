import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escucha en 0.0.0.0, necesario para exponer con ngrok
    port: 5173,
    // Necesario porque ngrok sirve desde un dominio distinto a localhost.
    // true = acepta cualquier host. Si querés restringirlo, poné
    // el dominio exacto que te da ngrok, ej: ['tuid.ngrok-free.app']
    allowedHosts: true,
  },
});
