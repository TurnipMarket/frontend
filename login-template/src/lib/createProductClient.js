import {
  API_BASE_URL,
  CREATE_PRODUCT_ENDPOINT,
  MOCK_MODE,
} from '../config';

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
}) {
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
        origin: typeof window !== 'undefined' ? window.location.origin : 'local',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      },
    },
  };

  if (MOCK_MODE) {
    // Simular latencia diferente a login/registro
    await simulateLatency(800, 1200);

    // Mock: Simular algunos escenarios
    const randomFail = Math.random();

    // 90% de éxito, 10% de conflicto
    if (randomFail < 0.1) {
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

    // Éxito: devolver datos simulados del producto creado
    const mockProductId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockUserId = 'user_123'; // Simular que viene del context

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
          image: image ? 'https://example.com/products/' + mockProductId + '.jpg' : null,
          seller_id: mockUserId,
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

  // Modo real: hacer POST al backend
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${CREATE_PRODUCT_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: { message: 'No se pudo conectar con el servidor.' },
      requestPayload,
    };
  }

  let raw = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  const data = raw
    ? {
        message: raw.mensaje ?? raw.message ?? null,
        product: raw.product
          ? {
              id: raw.product.id || raw.product_id,
              title: raw.product.title || raw.titulo,
              description: raw.product.description || raw.descripcion,
              category: raw.product.category || raw.categoria,
              price: raw.product.price || raw.precio,
              currency: raw.product.currency || raw.moneda,
              condition: raw.product.condition || raw.condicion,
              image: raw.product.image || raw.imagen,
              seller_id: raw.product.seller_id || raw.vendedor_id,
              status: raw.product.status || raw.estado,
              created_at: raw.product.created_at || raw.creado_en,
              updated_at: raw.product.updated_at || raw.actualizado_en,
            }
          : null,
        verification: raw.verification ? { ...raw.verification } : null,
      }
    : null;

  return { ok: response.ok, status: response.status, data, requestPayload };
}

/**
 * fetchUserProducts()
 *
 * Obtiene la lista de productos publicados por el usuario autenticado.
 * Útil para mostrar "Mis productos" en una página.
 */
export async function fetchUserProducts() {
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

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/user`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { ok: response.ok, status: response.status, data, offline: false };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: 'network_error', message: 'No se pudo conectar con el servidor.' },
      offline: true,
    };
  }
}

/**
 * updateProduct(productId, updates)
 *
 * Actualiza un producto existente.
 */
export async function updateProduct(productId, updates) {
  const requestPayload = {
    ...updates,
    metadata: {
      client: {
        origin: typeof window !== 'undefined' ? window.location.origin : 'local',
        timestamp: new Date().toISOString(),
      },
    },
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

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { ok: response.ok, status: response.status, data, requestPayload };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { message: 'No se pudo conectar con el servidor.' },
      requestPayload,
    };
  }
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

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = response.status === 204 ? null : await response.json().catch(() => null);

    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { message: 'No se pudo conectar con el servidor.' },
    };
  }
}

function simulateLatency(min = 400, max = 800) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}