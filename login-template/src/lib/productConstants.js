// Constantes del formulario de producto

export const CONDITIONS = [
  { id: 'new', label: 'Nuevo' },
  { id: 'like_new', label: 'Como nuevo' },
  { id: 'good', label: 'Buen estado' },
  { id: 'fair', label: 'Aceptable' },
];

export const CURRENCIES = [
  { id: 'ARS', label: 'Pesos Argentinos (ARS)' },
  { id: 'USD', label: 'Dólares (USD)' },
  { id: 'UYU', label: 'Pesos Uruguayos (UYU)' },
];

export const CATEGORIES = [
  { id: 'electronics', label: '📱 Electrónica' },
  { id: 'clothing', label: '👕 Ropa y Accesorios' },
  { id: 'home', label: '🏠 Hogar' },
  { id: 'sports', label: '⚽ Deportes' },
  { id: 'books', label: '📚 Libros' },
  { id: 'vehicles', label: '🚗 Vehículos' },
  { id: 'services', label: '🔧 Servicios' },
  { id: 'other', label: '📦 Otros' },
];

export const INITIAL_PRODUCT_FORM = {
  title: '',
  description: '',
  category: 'other',
  price: '',
  currency: 'ARS',
  condition: 'new',
  imageFile: null,
  imagePreview: null,
};
