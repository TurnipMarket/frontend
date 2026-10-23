import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  loadStoredAuth,
  persistAuth,
  clearStoredAuth,
  loadPendingVerification,
  persistPendingVerification,
  clearPendingVerification,
} from '../lib/authStorage';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  // Lazy initializer: lee localStorage UNA sola vez al montar,
  // no en cada render.
  const [session, setSession] = useState(
    () => loadStoredAuth() ?? { token: null, user: null, expiresAt: null },
  );
  const [pendingVerification, setPendingVerificationState] = useState(loadPendingVerification);

  const { token, user, expiresAt } = session;

  // Hay sesión activa: hay token y no venció.
  const isAuthenticated = Boolean(token) && (!expiresAt || Date.now() < expiresAt);

  const login = useCallback((response) => {
    setSession(persistAuth(response));
  }, []);

  const register = useCallback((response) => {
    if (response.token) {
      setSession(persistAuth(response));
    } else {
      setSession((prev) => ({ ...prev, user: response.user ?? null }));
    }
  }, []);

  const setPendingVerification = useCallback((info) => {
    persistPendingVerification(info);
    setPendingVerificationState(info);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    clearPendingVerification();
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
