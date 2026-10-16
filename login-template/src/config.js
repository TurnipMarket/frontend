const _host = import.meta.env.VITE_BACKEND_HOST || '127.0.0.1';
const _port = import.meta.env.VITE_BACKEND_PORT || '8000';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${_host}:${_port}`;

export const MOCK_MODE =
  import.meta.env.VITE_MOCK_MODE === 'true';

export const LOGIN_ENDPOINT = '/api/auth/login';
export const REGISTER_ENDPOINT = '/api/auth/register';
export const AVAILABILITY_ENDPOINT = '/api/auth/availability';
export const PRODUCTS_ENDPOINT = '/api/products';
export const CREATE_PRODUCT_ENDPOINT = '/api/products';
export const VERIFY_ENDPOINT = '/api/auth/verify';

export const CHAT_ENDPOINTS = {
  conversations: '/api/conversations',
  conversation: (id) =>
    `/api/conversations/${encodeURIComponent(id)}`,
  messages: (id) =>
    `/api/conversations/${encodeURIComponent(id)}/messages`,
  read: (id) =>
    `/api/conversations/${encodeURIComponent(id)}/read`,
};

export const CHAT_POLL_MS = 4000;

export const MOCK_TAKEN_USERNAMES = [
  'admin',
  'test',
  'usuario',
  'soporte',
];

export const MOCK_TAKEN_EMAILS = ['ya@existe.com'];
export const MOCK_TAKEN_PHONES = ['+5491111111111'];

export const AUTH_PROVIDERS = [
  { id: 'discord', label: 'Continuar con Discord' },
  { id: 'sms', label: 'Continuar con SMS' },
];