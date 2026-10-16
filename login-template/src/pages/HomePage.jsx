import { useEffect, useState } from 'react';
import { fetchProducts } from '../lib/productClient';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { OfflineBanner } from '../components/layout/OfflineBanner.jsx';
import { LoadingSpinner } from '../components/layout/LoadingSpinner.jsx';
import { ProductCard } from '../components/product/ProductCard.jsx';
import './HomePage.css';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      const result = await fetchProducts();
      if (cancelled) return;

      if (result.offline) {
        setOffline(true);
        setProducts([]);
        setStatus('error');
      } else if (result.ok) {
        setOffline(false);
        setProducts(result.data?.products ?? []);
        setStatus('ready');
      } else {
        setOffline(true);
        setProducts([]);
        setStatus('error');
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="home">
      {offline && <OfflineBanner />}
      
      <Header 
        user={user} 
        isAuthenticated={isAuthenticated} 
        logout={logout} 
      />

      <main className="home__main">
        <section className="home__hero">
          <h1 className="home__title">
            Productos <em>disponibles</em>
          </h1>
          <p className="home__subtitle">
            Explorá el catálogo y contactá al vendedor directamente.
          </p>
          {isAuthenticated && (
            <a href="#/crear-producto" className="home__cta">
              Publicar un producto
            </a>
          )}
        </section>

        {status === 'loading' && <LoadingSpinner message="Cargando productos…" />}

        {status === 'error' && offline && (
          <div className="home__empty">
            <p>No hay productos para mostrar en este momento.</p>
            <p className="home__empty-hint">Intentá de nuevo más tarde cuando el servidor esté disponible.</p>
          </div>
        )}

        {status === 'ready' && products.length === 0 && (
          <div className="home__empty">
            <p>No hay productos publicados aún.</p>
          </div>
        )}

        {status === 'ready' && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
