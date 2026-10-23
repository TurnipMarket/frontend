import {
  API_BASE_URL,
  CREATE_PRODUCT_ENDPOINT,
  MOCK_MODE,
} from '../config';
import { simulateLatency } from './delay';
import { authHeaders, originMeta, postJson, requestJson } from './http';

/**
 * pick(obj, keys, fallback)
 *
 * Devuelve el primer valor definido de una lista de nombres posibles.
 * Sirve para aceptar los alias de campo que puede mandar el backend.
 */
function pick(obj, keys, fallback = null) {
  for (const key of keys) {
    if (obj?.[key] != null) return obj[key];
  }
  return fallback;
}

/**
 * mapProduct(product, raw)
 *
 * Normaliza un producto aceptando los nombres de campo en inglés y en
 * español, tanto anidados como a nivel raíz.
 */
function mapProduct(product, raw = {}) {
  return {
    id: pick(product, ['id', 'product_id'], raw.id),
    title: pick(product, ['title', 'titulo'], raw.title),
    description: pick(product, ['description', 'descripcion'], raw.description),
    category: pick(product, ['category', 'categoria'], raw.category),
    price: pick(product, ['price', 'precio'], raw.price),
    currency: pick(product, ['currency', 'moneda'], raw.currency),
    condition: pick(product, ['condition', 'condicion'], raw.condition),
    image: pick(product, ['image', 'imagen'], raw.image),
    seller_id: pick(product, ['seller_id', 'vendedor_id'], raw.seller_id),
    status: pick(product, ['status', 'estado'], raw.status),
    created_at: pick(product, ['created_at', 'creado_en'], raw.created_at),
    updated_at: pick(product, ['updated_at', 'actualizado_en'], raw.updated_at),
  };
}

/**
 * createProduct(payload)
 *
 * Crea un nuevo producto. En mock mode devuelve una respuesta simulada
 * con datos diferentes a los de login/registro.
 *
 * @param {Object} payload - Datos del producto
 *   - title: string (3-100 caracteres)
 *   - description: string (10-2000 caracteres)
 *   - category: string ('electronics', 'clothing', etc.)
 *   - price: number (> 0)
 *   - currency: string ('ARS', 'USD', 'UYU')
 *   - condition: string ('new', 'like_new', 'good', 'fair')
 *   - image: string|null (base64 de la imagen, opcional)
 * @param {string|null} token - Token de sesión. Si viene, se manda como
 *   Authorization: Bearer para que el backend sepa quién publica.
 *
 * @returns {Object} { ok, status, data, requestPayload }
 */
export async function createProduct({
  title,
  description,
  category,
  price,
  currency,
  condition,
  image,
}, token = null) {
  const requestPayload = {
    title,
    description,
    category,
    price,
    currency,
    condition,
    image: image || null, // base64 o null
    metadata: {
      client: {
        ...originMeta().client,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      },
    },
  };

  if (MOCK_MODE) {
    await simulateLatency(800, 1200);

    // 90% de éxito, 10% de conflicto
    if (Math.random() < 0.1) {
      return {
        ok: false,
        status: 409,
        data: {
          error: 'title_duplicated',
          message: 'Ya existe un producto con ese título. Probá con otro nombre.',
        },
        requestPayload,
      };
    }

    const mockProductId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      ok: true,
      status: 201,
      data: {
        message: 'Producto publicado correctamente.',
        product: {
          id: mockProductId,
          title,
          description,
          category,
          price,
          currency,
          condition,
          image: image ? `https://example.com/products/${mockProductId}.jpg` : null,
          seller_id: 'user_123',
          status: 'published',
          views: 0,
          likes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        verification: {
          status: 'pending',
          message: 'Tu producto está pendiente de verificación. Te notificaremos cuando sea aprobado.',
        },
      },
      requestPayload,
    };
  }

  const result = await postJson(`${API_BASE_URL}${CREATE_PRODUCT_ENDPOINT}`, requestPayload, {
    token,
    successMessage: 'Producto publicado.',
    failureMessage: 'No pudimos publicar tu producto.',
  });

  if (!result.ok || !result.data) return result;

  const raw = result.data;
  return {
    ...result,
    data: {
      ...raw,
      product: raw.product ? mapProduct(raw.product, raw) : null,
      verification: raw.verification ? { ...raw.verification } : null,
    },
  };
}

/**
 * fetchUserProducts(token)
 *
 * Obtiene la lista de productos publicados por el usuario autenticado.
 *
 * @param {string|null} token - Token de sesión (Authorization: Bearer).
 */
export async function fetchUserProducts(token = null) {
  if (MOCK_MODE) {
    await simulateLatency(600, 900);
    return {
      ok: true,
      status: 200,
      data: {
        products: [
          {
            id: 'prod_001',
            title: 'Laptop Asus VivoBook 15',
            description: 'Laptop en perfecto estado, poco uso, con caja y accesorios originales.',
            category: 'electronics',
            price: 85000,
            currency: 'ARS',
            condition: 'like_new',
            image: null,
            status: 'published',
            views: 42,
            likes: 3,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'prod_002',
            title: 'Bicicleta Mountain Bike 27.5"',
            description: 'Bici para trail, 18 velocidades, frenos de disco. Poco uso.',
            category: 'sports',
            price: 45000,
            currency: 'ARS',
            condition: 'good',
            image: null,
            status: 'published',
            views: 18,
            likes: 1,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
      offline: false,
    };
  }

  return requestJson(`${API_BASE_URL}/api/products/user`, {
    method: 'GET',
    headers: authHeaders(token),
  });
}

/**
 * updateProduct(productId, updates)
 *
 * Actualiza un producto existente.
 */
export async function updateProduct(productId, updates) {
  const requestPayload = {
    ...updates,
    metadata: { client: originMeta().client },
  };

  if (MOCK_MODE) {
    await simulateLatency(600, 1000);
    return {
      ok: true,
      status: 200,
      data: {
        message: 'Producto actualizado correctamente.',
        product: { id: productId, ...updates },
      },
      requestPayload,
    };
  }

  return requestJson(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'PATCH',
    headers: authHeaders(null),
    body: JSON.stringify(requestPayload),
  });
}

/**
 * deleteProduct(productId)
 *
 * Elimina un producto.
 */
export async function deleteProduct(productId) {
  if (MOCK_MODE) {
    await simulateLatency(400, 700);
    return {
      ok: true,
      status: 204,
      data: { message: 'Producto eliminado correctamente.' },
    };
  }

  return requestJson(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(null),
  });
}
