import { describe, it, expect } from 'vitest';
import { normalizeProducts, extractMessage } from '../src/lib/apiResponse.js';

describe('apiResponse', () => {
  describe('normalizeProducts', () => {
    it('normaliza un array plano de productos', () => {
      const raw = [
        { id: '1', title: 'Producto 1', price: 100 },
        { id: '2', title: 'Producto 2', price: 200 },
      ];
      const result = normalizeProducts(raw);
      expect(result).toHaveProperty('products');
      expect(result.products).toHaveLength(2);
    });

    it('maneja respuesta null', () => {
      const result = normalizeProducts(null);
      expect(result).toHaveProperty('products');
      expect(result.products).toHaveLength(0);
    });

    it('maneja respuesta con products ya presente', () => {
      const raw = { products: [{ id: '1', title: 'Producto' }] };
      const result = normalizeProducts(raw);
      expect(result.products).toHaveLength(1);
    });

    it('maneja respuesta con productos (español)', () => {
      const raw = { productos: [{ id: '1', title: 'Producto' }] };
      const result = normalizeProducts(raw);
      expect(result.products).toHaveLength(1);
    });
  });

  describe('extractMessage', () => {
    it('extrae mensaje del campo detail', () => {
      const raw = { detail: 'Error de prueba' };
      expect(extractMessage(raw)).toBe('Error de prueba');
    });

    it('extrae mensaje del campo message', () => {
      const raw = { message: 'Mensaje alternativo' };
      expect(extractMessage(raw)).toBe('Mensaje alternativo');
    });

    it('extrae mensaje del campo mensaje', () => {
      const raw = { mensaje: 'Mensaje en español' };
      expect(extractMessage(raw)).toBe('Mensaje en español');
    });

    it('maneja ValidationError con array de detalles', () => {
      const raw = {
        detail: [
          { loc: ['body', 'email'], msg: 'invalid email', type: 'value_error' },
          { loc: ['body', 'password'], msg: 'too short', type: 'value_error' },
        ],
      };
      const result = extractMessage(raw);
      expect(result).toContain('email: invalid email');
      expect(result).toContain('password: too short');
    });

    it('usa mensaje por defecto si no hay mensaje', () => {
      const raw = {};
      expect(extractMessage(raw, 'Mensaje por defecto')).toBe('Mensaje por defecto');
    });

    it('maneja respuesta null', () => {
      expect(extractMessage(null, 'Fallback')).toBe('Fallback');
    });
  });
});
