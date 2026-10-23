import { API_BASE_URL, PRODUCTS_ENDPOINT, MOCK_MODE } from '../config';
import { normalizeProducts } from './apiResponse';
import { simulateLatency } from './delay';
import { authHeaders, requestJson } from './http';

const MOCK_PRODUCTS = [
  {
    id: 'p001',
    title: 'Zapatos Atlas Runner',
    description: 'Zapatillas running con amortiguación reactiva.',
    price: 129999,
    currency: 'ARS',
    image: null,
    seller: 'atlas_running',
    condition: 'new',
  },
  {
    id: 'p002',
    title: 'Mochila Trail 40L',
    description: 'Mochila impermeable con soporte lumbar ajustable.',
    price: 87500,
    currency: 'ARS',
    image: null,
    seller: 'outdoor_pro',
    condition: 'new',
  },
  {
    id: 'p003',
    title: 'Auriculares NovaBass',
    description: 'Bluetooth 5.3, cancelación de ruido activa, 30h de batería.',
    price: 64900,
    currency: 'ARS',
    image: null,
    seller: 'techstore',
    condition: 'new',
  },
  {
    id: 'p004',
    title: 'Reloj Field Automático',
    description: 'Movimiento automático japonés, caja de titanio.',
    price: 315000,
    currency: 'ARS',
    image: null,
    seller: 'tiempo_relojes',
    condition: 'new',
  },
  {
    id: 'p005',
    title: 'Campera Down Light',
    description: 'Pluma de ganso 700 fill, ultra liviana y compacta.',
    price: 98000,
    currency: 'ARS',
    image: null,
    seller: 'mountain_gear',
    condition: 'new',
  },
  {
    id: 'p006',
    title: 'Silla Ergonómica Pro',
    description: 'Soporte lumbar 4D, reposabrazos ajustable, malla transpirable.',
    price: 245000,
    currency: 'ARS',
    image: null,
    seller: 'office_hub',
    condition: 'new',
  },
];

/**
 * fetchProducts()
 *
 * Devuelve la lista de productos del catálogo público.
 * En MOCK_MODE devuelve datos de ejemplo sin llamar al backend.
 *
 * Devuelve { ok, status, data, offline }
 * - offline = true cuando el backend no responde (fetch falló).
 */
export async function fetchProducts() {
  if (MOCK_MODE) {
    await simulateLatency(400, 600);
    return {
      ok: true,
      status: 200,
      data: { products: MOCK_PRODUCTS },
      offline: false,
    };
  }

  const result = await requestJson(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`, {
    method: 'GET',
    headers: authHeaders(null),
  });

  if (!result.ok) return result;

  // El backend devuelve un array plano; la UI espera { products }.
  return { ...result, data: normalizeProducts(result.data) };
}
