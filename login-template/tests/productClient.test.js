import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchProducts } from '../src/lib/productClient.js';

describe('productClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetchProducts devuelve productos cuando fetch funciona', async () => {
    const mockProducts = [
      { id: '1', title: 'Producto 1', price: 100, seller: 'user1' },
      { id: '2', title: 'Producto 2', price: 200, seller: 'user2' },
    ];
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    });

    const result = await fetchProducts();
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('products');
    expect(result.data.products).toHaveLength(2);
  });

  it('fetchProducts devuelve productos con estructura correcta', async () => {
    const mockProducts = [
      { id: '1', title: 'Producto 1', price: 100, seller: 'user1' },
    ];
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    });

    const result = await fetchProducts();
    const products = result.data.products;
    expect(products.length).toBeGreaterThan(0);
    const product = products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('title');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('seller');
  });

  it('fetchProducts maneja error de red', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const result = await fetchProducts();
    expect(result.ok).toBe(false);
    expect(result.offline).toBe(true);
  });

  it('fetchProducts maneja respuesta no ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Server error' }),
    });

    const result = await fetchProducts();
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
  });
});
