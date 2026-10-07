// ─────────────────────────────────────────────────────────────
// RUTAS DE LA APP — fuente única de verdad.
//
// El router sigue siendo liviano (hash + useState), pero ahora la
// definición de "qué ruta existe" y "qué ruta necesita sesión"
// vive acá, en lugar de estar esparcida con ifs dentro de App.jsx.
// ─────────────────────────────────────────────────────────────

// Rutas públicas: se pueden ver sin sesión iniciada.
export const ROUTES = {
  '#/': 'home',
  '#/login': 'login',
  '#/registro': 'register',
  '#/verificar-cuenta': 'verify-account',
  '#/crear-producto': 'create-product',
};

// Rutas protegidas: SOLO accesibles con sesión iniciada.
// Si alguien entra sin sesión, se lo manda a #/login recordando
// a dónde quería ir (parámetro ?next=).
export const PROTECTED_ROUTES = new Set(['create-product']);

/**
 * parseHash()
 *
 * Lee el hash de la URL y lo descompone en ruta + parámetros.
 * Acepta "#/login?next=%23%2Fcrear-producto" y devuelve:
 *   { route: 'login', params: URLSearchParams { next: '#/crear-producto' } }
 *
 * Un hash desconocido o vacío cae en la home.
 */
export function parseHash(hash) {
  const raw = (hash ?? window.location.hash) || '#/';
  const [path, queryString = ''] = raw.split('?');

  return {
    route: ROUTES[path] ?? 'home',
    path: ROUTES[path] ? path : '#/',
    params: new URLSearchParams(queryString),
  };
}

/**
 * isProtectedPath(hash)
 *
 * True si ese hash apunta a una ruta que exige sesión.
 */
export function isProtectedPath(hash) {
  return PROTECTED_ROUTES.has(parseHash(hash).route);
}

/**
 * loginHrefFor(path)
 *
 * Construye el link a la página de login preservando el destino.
 * Ej: loginHrefFor('#/crear-producto') → '#/login?next=%23%2Fcrear-producto'
 */
export function loginHrefFor(path) {
  return `#/login?next=${encodeURIComponent(path)}`;
}

/**
 * safeNext(params)
 *
 * Lee el parámetro ?next= y lo valida: solo se acepta un hash
 * interno conocido. Así un usuario no puede inyectar una URL
 * externa para el redirect posterior al login.
 */
export function safeNext(params) {
  const next = params.get('next');
  if (!next) return '#/';
  return ROUTES[next] ? next : '#/';
}
