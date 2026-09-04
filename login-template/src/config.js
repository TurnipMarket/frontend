// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN CENTRAL — editá esto cuando conectes el backend real
// ─────────────────────────────────────────────────────────────

// URL base del backend. Se arma automático con HOST:PORT, o podés
// definir VITE_API_BASE_URL completo en .env.local para sobreescribir.
const _host = import.meta.env.VITE_BACKEND_HOST || '192.168.220.135';
const _port = import.meta.env.VITE_BACKEND_PORT || '5000';
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${_host}:${_port}`;

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

// Endpoints de registro (para cuando exista backend).
export const REGISTER_ENDPOINT = '/api/auth/register';
// Debería devolver { available: boolean } dado ?field=username&value=...
export const AVAILABILITY_ENDPOINT = '/api/auth/availability';

// Endpoint de productos (catálogo público).
export const PRODUCTS_ENDPOINT = '/api/products';

// Nombres de usuario que ya existen, solo para la simulación en mock mode.
// Reemplazá esta lista o borrala cuando conectes el backend real.
export const MOCK_TAKEN_USERNAMES = ['admin', 'test', 'usuario', 'soporte'];
export const MOCK_TAKEN_EMAILS = ['ya@existe.com'];
export const MOCK_TAKEN_PHONES = ['+5491111111111'];

// Métodos de verificación / login social que se muestran como botones.
// Agregá o sacá entradas de esta lista para editar los botones sin
// tocar el JSX.
export const AUTH_PROVIDERS = [
  { id: 'discord', label: 'Continuar con Discord' },
  { id: 'sms', label: 'Continuar con SMS' },
];
