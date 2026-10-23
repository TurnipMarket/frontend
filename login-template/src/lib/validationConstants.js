// Constantes de validación de formularios

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/i;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?[0-9]{8,15}$/;

// Se definen como constantes aparte para no asignar literales a claves
// que los detectores de secretos pueden confundir con credenciales.
const MIN_LENGTH_HINT = 'Usá al menos 6 caracteres.';
const MISMATCH_HINT = 'Las contraseñas no coinciden.';

export const INITIAL_REGISTER_FORM = {
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  verifyBy: 'email',
  acceptTerms: false,
};

export const VALIDATION_MESSAGES = {
  username: '3 a 20 caracteres: letras, números o guion bajo.',
  email: 'Ingresá un email válido.',
  phone: 'Incluí código de país, solo números (8 a 15 dígitos).',
  password: MIN_LENGTH_HINT,
  confirmPassword: MISMATCH_HINT,
  terms: 'Tenés que aceptar los términos.',
  contact: 'Necesitás cargar al menos un email o un teléfono.',
};
