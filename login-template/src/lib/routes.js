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

export function safeNext(params) {
  const next = params.get('next');

  if (!next || !next.startsWith('#/')) {
    return '#/';
  }

  const parsed = parseHash(next);

  if (parsed.path !== next.split('?')[0]) {
    return '#/';
  }

  if (parsed.route === 'home' && next.split('?')[0] !== '#/') {
    return '#/';
  }

  if (!ROUTES[`#/${parsed.route === 'profile' ? 'perfil' : parsed.route === 'messages' ? 'mensajes' : parsed.route}`]) {
    if (
      parsed.route !== 'profile' &&
      parsed.route !== 'messages'
    ) {
      return '#/';
    }
  }

  return next;
}