import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'cv_token';
const STORAGE_KEY_USER = 'cv_user';
const STORAGE_KEY_PENDING = 'cv_pending_verification';
const STORAGE_KEY_META = 'cv_session_meta';

// Si el backend no manda vencimiento, la sesión se considera
// válida por 30 días. Es tiempo suficiente para "recordarme" y
// finito para que una sesión abandonada no viva para siempre.
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * resolveExpiry(response)
 *
 * Interpreta la expiración que devuelve el backend. Acepta los
 * nombres más habituales, distinguiendo absolutos de relativos:
 *
 *   expiresAt / expires_at → marca de tiempo absoluta (ms o ISO)
 *   expiresIn / expires_in → segundos de validez desde ahora
 *
 * Si el backend no manda ninguna, cae en el TTL por defecto.
 */
function resolveExpiry(response) {
  const absolute = response?.expiresAt ?? response?.expires_at;
  if (typeof absolute === 'number' && Number.isFinite(absolute)) {
    // Unix en segundos (~1.7e9) vs. Unix en milisegundos (~1.7e12).
    // Sin esta corrección, un timestamp en segundos se leería como
    // 1970 y la sesión se vencería al instante.
    return absolute < 1e12 ? absolute * 1000 : absolute;
  }
  if (typeof absolute === 'string') {
    const parsed = Date.parse(absolute);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const relative = response?.expiresIn ?? response?.expires_in;
  if (typeof relative === 'number' && Number.isFinite(relative) && relative > 0) {
    return Date.now() + relative * 1000;
  }

  return Date.now() + DEFAULT_TTL_MS;
}

/**
 * loadStoredAuth()
 *
 * Recupera la sesión guardada en localStorage al abrir la app.
 * Esto es lo que hace que la sesión "sobreviva" a cerrar y reabrir
 * el navegador. Si el token venció o el storage está corrupto,
 * devuelve sesión vacía y limpia lo que quedó.
 */
function loadStoredAuth() {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userRaw = localStorage.getItem(STORAGE_KEY_USER);
    if (!token || !userRaw) return null;

    const user = JSON.parse(userRaw);
    const meta = readJson(STORAGE_KEY_META);

    // Token expirado → limpiar y tratar como sesión cerrada.
    if (meta?.expiresAt && Date.now() > meta.expiresAt) {
      clearStoredAuth();
      return null;
    }

    return { token, user, expiresAt: meta?.expiresAt ?? null };
  } catch {
    // localStorage corrupto o inaccesible (modo privado, etc.)
    clearStoredAuth();
    return null;
  }
}

function clearStoredAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_META);
  } catch {
    // si no se puede limpiar, seguimos igual con el estado en memoria
  }
}

function loadPendingVerification() {
  return readJson(STORAGE_KEY_PENDING);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  // Lazy initializer: lee localStorage UNA sola vez al montar,
  // no en cada render.
  const [session, setSession] = useState(() => {
    const stored = loadStoredAuth();
    return stored ?? { token: null, user: null, expiresAt: null };
  });
  const [pendingVerification, setPendingVerificationState] = useState(loadPendingVerification);

  const { token, user, expiresAt } = session;

  // Hay sesión activa: hay token y no venció.
  const isAuthenticated = Boolean(token) && (!expiresAt || Date.now() < expiresAt);

  // response = cuerpo completo devuelto por el backend, del cual
  // se saca tanto el token/usuario como la expiración.
  const saveAuth = useCallback((response) => {
    const newToken = response.token;
    const newUser = response.user ?? null;
    const newExpiresAt = resolveExpiry(response);
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser ?? null));
      localStorage.setItem(
        STORAGE_KEY_META,
        JSON.stringify({ expiresAt: newExpiresAt, savedAt: Date.now() }),
      );
    } catch {
      // Sin localStorage disponible: la sesión vive solo en memoria.
    }
    setSession({ token: newToken, user: newUser ?? null, expiresAt: newExpiresAt });
  }, []);

  const login = useCallback((response) => {
    saveAuth(response);
  }, [saveAuth]);

  const register = useCallback((response) => {
    if (response.token) {
      saveAuth(response);
    } else {
      setSession((prev) => ({ ...prev, user: response.user ?? null }));
    }
  }, [saveAuth]);

  const setPendingVerification = useCallback((info) => {
    try {
      if (info) {
        localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(info));
      } else {
        localStorage.removeItem(STORAGE_KEY_PENDING);
      }
    } catch {
      // ignorado: el estado en memoria sigue funcionando
    }
    setPendingVerificationState(info);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    try {
      localStorage.removeItem(STORAGE_KEY_PENDING);
    } catch {
      // ignorado
    }
    setSession({ token: null, user: null, expiresAt: null });
    setPendingVerificationState(null);
  }, []);

  // Si la sesión tenía vencimiento, programa el cierre automático.
  // Mientras la pestaña esté abierta, el token no se usa vencido.
  useEffect(() => {
    if (!token || !expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(logout, Math.min(remaining, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [token, expiresAt, logout]);

  // Red de contención: los timers se throttlean cuando la pestaña
  // está en background, así que al volver el foco a la ventana
  // revisamos que el token no haya vencido en el medio.
  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => {
      const stillValid = !expiresAt || Date.now() < expiresAt;
      if (!stillValid) logout();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, expiresAt, logout]);

  return (
    <AuthContext.Provider value={{
      token, user, isAuthenticated, expiresAt,
      pendingVerification, setPendingVerification,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
