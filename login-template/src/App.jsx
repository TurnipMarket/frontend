import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Router liviano sin dependencias: solo dos rutas (login / registro),
// leídas del hash de la URL. Si el proyecto crece, esto es lo primero
// que conviene reemplazar por react-router.
function getRouteFromHash() {
  return window.location.hash === '#/registro' ? 'register' : 'login';
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route === 'register' ? <RegisterPage /> : <LoginPage />;
}
