import { describe, it, expect } from 'vitest';
import { parseHash, isProtectedPath, loginHrefFor, safeNext } from '../src/lib/routes.js';

describe('routes', () => {
  describe('parseHash', () => {
    it('parsea la ruta home', () => {
      const result = parseHash('#/');
      expect(result.route).toBe('home');
    });

    it('parsea la ruta login', () => {
      const result = parseHash('#/login');
      expect(result.route).toBe('login');
    });

    it('parsea la ruta registro', () => {
      const result = parseHash('#/registro');
      expect(result.route).toBe('register');
    });

    it('parsea la ruta crear-producto', () => {
      const result = parseHash('#/crear-producto');
      expect(result.route).toBe('create-product');
    });

    it('parsea la ruta perfil con username', () => {
      const result = parseHash('#/perfil/juan');
      expect(result.route).toBe('profile');
      expect(result.username).toBe('juan');
    });

    it('maneja rutas desconocidas como home', () => {
      const result = parseHash('#/ruta-desconocida');
      expect(result.route).toBe('home');
    });

    it('parsea parámetros de query string', () => {
      const result = parseHash('#/login?next=%23%2Fcrear-producto');
      expect(result.route).toBe('login');
      expect(result.params.get('next')).toBe('#/crear-producto');
    });
  });

  describe('isProtectedPath', () => {
    it('crear-producto es protegida', () => {
      expect(isProtectedPath('#/crear-producto')).toBe(true);
    });

    it('home no es protegida', () => {
      expect(isProtectedPath('#/')).toBe(false);
    });

    it('login no es protegida', () => {
      expect(isProtectedPath('#/login')).toBe(false);
    });
  });

  describe('loginHrefFor', () => {
    it('construye URL de login con next', () => {
      const result = loginHrefFor('#/crear-producto');
      expect(result).toBe('#/login?next=%23%2Fcrear-producto');
    });
  });

  describe('safeNext', () => {
    it('devuelve #/ si no hay next', () => {
      const params = new URLSearchParams();
      expect(safeNext(params)).toBe('#/');
    });

    it('devuelve #/ si next no es válido', () => {
      const params = new URLSearchParams('next=https://evil.com');
      expect(safeNext(params)).toBe('#/');
    });

    it('devuelve next si es una ruta válida', () => {
      const params = new URLSearchParams('next=%23%2Fcrear-producto');
      expect(safeNext(params)).toBe('#/crear-producto');
    });
  });
});
