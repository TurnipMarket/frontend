// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN CENTRAL — editá esto cuando conectes el backend real
// ─────────────────────────────────────────────────────────────

// URL base del backend. En local queda vacío/mock. Cuando tengas
// backend real, definila en un archivo .env.local:
//   VITE_API_BASE_URL=https://tu-backend.ngrok-free.app
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Mientras no haya backend, MOCK_MODE=true hace que el login
// no llame a ningún servidor: solo arma el JSON y lo muestra.
// Cuando conectes el backend real, poné esto en false
// (o definí VITE_MOCK_MODE=false en tu .env).
export const MOCK_MODE =
  import.meta.env.VITE_MOCK_MODE !== undefined
    ? import.meta.env.VITE_MOCK_MODE === 'true'
    : true;

// Endpoint de login relativo a API_BASE_URL (para cuando exista backend).
export const LOGIN_ENDPOINT = '/api/auth/login';

// Métodos de verificación / login social que se muestran como botones.
// Agregá o sacá entradas de esta lista para editar los botones sin
// tocar el JSX.
export const AUTH_PROVIDERS = [
  { id: 'discord', label: 'Continuar con Discord' },
  { id: 'sms', label: 'Continuar con SMS' },
];
