import { useState, useCallback, createContext, useContext } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'cv_token';
const STORAGE_KEY_USER = 'cv_user';

function loadStoredAuth() {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userRaw = localStorage.getItem(STORAGE_KEY_USER);
    if (token && userRaw) {
      return { token, user: JSON.parse(userRaw) };
    }
  } catch {
    // corrupt storage, ignore
  }
  return { token: null, user: null };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const initial = loadStoredAuth();
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);

  const isAuthenticated = Boolean(token);

  const saveAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback((data) => {
    saveAuth(data.token, data.user);
  }, [saveAuth]);

  const register = useCallback((data) => {
    if (data.token) {
      saveAuth(data.token, data.user);
    } else {
      setUser(data.user ?? null);
    }
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
