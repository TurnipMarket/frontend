import { describe, it, expect } from 'vitest';
import { MOCK_MODE, API_BASE_URL, PRODUCTS_ENDPOINT } from '../src/config.js';

describe('config', () => {
  it('MOCK_MODE está definido', () => {
    expect(typeof MOCK_MODE).toBe('boolean');
  });

  it('API_BASE_URL es una URL válida', () => {
    expect(API_BASE_URL).toMatch(/^https?:\/\//);
  });

  it('PRODUCTS_ENDPOINT es un string', () => {
    expect(typeof PRODUCTS_ENDPOINT).toBe('string');
    expect(PRODUCTS_ENDPOINT).toBe('/api/products');
  });
});
