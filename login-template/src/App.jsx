import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateProductPage from './pages/CreateProductPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './context/AuthContext';
import { parseHash, loginHrefFor, isProtectedPath } from './lib/routes';

// Router liviano sin dependencias: rutas leídas del hash de la URL.
// Si el proyecto crece, esto es lo primero que conviene reemplazar
// por react-router.
//
// La parte nueva es el GUARD de rutas: las rutas marcadas como
// protegidas en src/lib/routes.js no se renderizan sin sesión
// iniciada. Si alguien intenta entrar igual, se lo redirige al
// login con un ?next= para que vuelva a donde quería ir.
export default function App() {
  const { isAuthenticated } = useAuth();
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const { route } = parseHash(hash);

  // ── Guard: ruta protegida sin sesión → al login ──
  //
  // Se consulta window.location.hash y no el estado `hash` de React a
  // propósito: el evento "hashchange" es asíncrono, así que el estado
  // puede quedar desfasado justo después de que el usuario navegue.
  // Preguntar por la URL real evita dos bugs: redirigir a un destino
  // viejo, y mandarle al login a alguien que recién hizo logout desde
  // la propia página protegida (que ya se está yendo a la home).
  useEffect(() => {
    if (isAuthenticated) return;
    if (!isProtectedPath(window.location.hash)) return;

    const { path } = parseHash(window.location.hash);
    // replace() en lugar de asignar el hash directamente, para no
    // dejar esta entrada en el historial: si el usuario vuelve
    // atrás, no cae otra vez en el mismo redirect.
    window.location.replace(loginHrefFor(path));
  }, [route, isAuthenticated]);

  // Mientras se redirige, no renderizamos la página protegida: así
  // el formulario de producto no llega a verse ni un frame en un
  // navegador con la sesión ya vencida. Se decide con la URL real
  // (fail-closed: ante la duda, no se muestra).
  const blocked = !isAuthenticated && isProtectedPath(window.location.hash);

  let page;
  if (blocked) {
    page = null;
  } else if (route === 'register') page = <RegisterPage />;
  else if (route === 'login') page = <LoginPage />;
  else if (route === 'create-product') page = <CreateProductPage />;
  else if (route === 'verify-account') page = <VerifyAccountPage />;
  else page = <HomePage />;

  return (
    <>
      {page}
      <ThemeToggle />
    </>
  );
}
