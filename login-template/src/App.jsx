import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Router liviano sin dependencias: rutas leídas del hash de la URL.
// Si el proyecto crece, esto es lo primero que conviene reemplazar
// por react-router.
function getRouteFromHash() {
  const hash = window.location.hash;
  if (hash === '#/registro') return 'register';
  if (hash === '#/login') return 'login';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'register') return <RegisterPage />;
  if (route === 'login') return <LoginPage />;
  return <HomePage />;
}
