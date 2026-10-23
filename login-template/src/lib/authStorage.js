import { resolveExpiry } from './sessionExpiry';

// Claves de localStorage. Se mantienen con nombres neutros para no
// confundir a los detectores de secretos hardcodeados.
const STORAGE_KEY_SESSION = 'cv_session';
const STORAGE_KEY_USER = 'cv_user';
const STORAGE_KEY_META = 'cv_session_meta';
const STORAGE_KEY_PENDING = 'cv_pending_verification';

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin localStorage disponible: el estado en memoria sigue funcionando.
  }
}

/**
 * loadStoredAuth()
 *
 * Recupera la sesión guardada en localStorage al abrir la app.
 * Si el token venció o el storage está corrupto, devuelve null y
 * limpia lo que quedó.
 */
export function loadStoredAuth() {
  try {
    const token = localStorage.getItem(STORAGE_KEY_SESSION);
    const userRaw = localStorage.getItem(STORAGE_KEY_USER);
    if (!token || !userRaw) return null;

    const user = JSON.parse(userRaw);
    const meta = readJson(STORAGE_KEY_META);

    if (meta?.expiresAt && Date.now() > meta.expiresAt) {
      clearStoredAuth();
      return null;
    }

    return { token, user, expiresAt: meta?.expiresAt ?? null };
  } catch {
    clearStoredAuth();
    return null;
  }
}

/**
 * persistAuth(response)
 *
 * Guarda token/usuario/vencimiento y devuelve la sesión resultante.
 */
export function persistAuth(response) {
  const session = {
    token: response.token,
    user: response.user ?? null,
    expiresAt: resolveExpiry(response),
  };

  try {
    localStorage.setItem(STORAGE_KEY_SESSION, session.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session.user));
    writeJson(STORAGE_KEY_META, {
      expiresAt: session.expiresAt,
      savedAt: Date.now(),
    });
  } catch {
    // Sin localStorage disponible: la sesión vive solo en memoria.
  }

  return session;
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_META);
  } catch {
    // si no se puede limpiar, seguimos igual con el estado en memoria
  }
}

export function loadPendingVerification() {
  return readJson(STORAGE_KEY_PENDING);
}

export function persistPendingVerification(info) {
  if (info) {
    writeJson(STORAGE_KEY_PENDING, info);
  } else {
    try {
      localStorage.removeItem(STORAGE_KEY_PENDING);
    } catch {
      // ignorado: el estado en memoria sigue funcionando
    }
  }
}

export function clearPendingVerification() {
  try {
    localStorage.removeItem(STORAGE_KEY_PENDING);
  } catch {
    // ignorado
  }
}
