import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateProductPage from './pages/CreateProductPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import ThemeToggle from './components/ThemeToggle';

// Router liviano sin dependencias: rutas leídas del hash de la URL.
// Si el proyecto crece, esto es lo primero que conviene reemplazar
// por react-router.
function getRouteFromHash() {
  const hash = window.location.hash;
  if (hash === '#/registro') return 'register';
  if (hash === '#/login') return 'login';
  if (hash === '#/crear-producto') return 'create-product';
  if (hash === '#/verificar-cuenta') return 'verify-account';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  let page;
  if (route === 'register') page = <RegisterPage />;
  if (route === 'login') page = <LoginPage />;
  if (route === 'create-product') page = <CreateProductPage />;
  if (route === 'verify-account') page = <VerifyAccountPage />;
  if (!page) page = <HomePage />;

  return (
    <>
      {page}
      <ThemeToggle />
    </>
  );
}
