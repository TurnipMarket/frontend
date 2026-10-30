export const ROUTES = {
  '#/': 'home',
  '#/login': 'login',
  '#/registro': 'register',
  '#/verificar-cuenta': 'verify-account',
  '#/crear-producto': 'create-product',
  '#/perfil': 'profile',
  '#/mensajes': 'messages',
};

export const PROTECTED_ROUTES = new Set([
  'create-product',
  'messages',
]);

export function parseHash(hash) {
  const raw = (hash ?? window.location.hash) || '#/';
  const [path, queryString = ''] = raw.split('?');

  const pathParts = path
    .split('/')
    .filter((part) => part && part !== '#');

  if (
    (pathParts[0] === 'perfil' ||
      pathParts[0] === 'mensajes') &&
    pathParts[1]
  ) {
    let username;

    try {
      username = decodeURIComponent(pathParts[1]);
    } catch {
      username = pathParts[1];
    }

    return {
      route: pathParts[0] === 'perfil' ? 'profile' : 'messages',
      path,
      params: new URLSearchParams(queryString),
      username,
    };
  }

  return {
    route: ROUTES[path] ?? 'home',
    path: ROUTES[path] ? path : '#/',
    params: new URLSearchParams(queryString),
  };
}

export function isProtectedPath(hash) {
  return PROTECTED_ROUTES.has(parseHash(hash).route);
}

export function loginHrefFor(path) {
  return `#/login?next=${encodeURIComponent(path)}`;
}

function getRouteKey(route) {
  if (route === 'profile') return 'perfil';
  if (route === 'messages') return 'mensajes';
  return route;
}

function isValidProfileOrMessages(parsed, nextPath) {
  if (parsed.route !== 'profile' && parsed.route !== 'messages') {
    return false;
  }
  const key = `#/${getRouteKey(parsed.route)}`;
  return Boolean(ROUTES[key]) && ROUTES[key] === parsed.route;
}

export function safeNext(params) {
  const next = params.get('next');

  if (!next || !next.startsWith('#/')) {
    return '#/';
  }

  const nextPath = next.split('?')[0];
  const parsed = parseHash(next);

  if (parsed.path !== nextPath) {
    return '#/';
  }

  if (parsed.route === 'home' && nextPath !== '#/') {
    return '#/';
  }

  if (ROUTES[nextPath]) {
    return next;
  }

  if (isValidProfileOrMessages(parsed, nextPath)) {
    return next;
  }

  return '#/';
}