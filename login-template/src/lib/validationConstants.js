// Constantes de validación de formularios

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/i;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?[0-9]{8,15}$/;

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
  password: 'Usá al menos 6 caracteres.',
  confirmPassword: 'Las contraseñas no coinciden.',
  terms: 'Tenés que aceptar los términos.',
  contact: 'Necesitás cargar al menos un email o un teléfono.',
};
