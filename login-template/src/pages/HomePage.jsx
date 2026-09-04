import { useEffect, useState } from 'react';
import SealMark from '../components/SealMark';
import { fetchProducts } from '../lib/productClient';
import { useAuth } from '../context/AuthContext';
import { MOCK_MODE } from '../config';
import './HomePage.css';

function formatPrice(price, currency) {
  if (currency === 'ARS') {
    return '$ ' + price.toLocaleString('es-AR');
  }
  return `${currency} ${price.toLocaleString()}`;
}

function displayName(user) {
  if (!user) return null;
  return user.username || user.name || user.identifier || (user.email ? user.email.split('@')[0] : null);
}

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
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
      {/* ── Banner offline ── */}
      {offline && (
        <div className="offline-banner" role="alert">
          <span className="offline-banner__icon" aria-hidden="true">⚠</span>
          <div className="offline-banner__text">
            <strong>Sin conexión con el servidor</strong>
            <p>
              No se pudieron cargar los productos porque el backend no está disponible.
              {MOCK_MODE && ' Estás en modo demo (sin servidor).'}
            </p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="home__header">
        <div className="home__header-inner">
          <a href="#/" className="home__logo">
            <SealMark size={40} />
            <span className="home__brand">Contactos Verificados</span>
          </a>
          <nav className="home__nav">
            {isAuthenticated ? (
              <>
                <span className="home__nav-user">
                  Hola, {displayName(user) ?? 'usuario'}
                </span>
                <button type="button" className="home__nav-link home__nav-link--btn" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <a href="#/login" className="home__nav-link">Iniciar sesión</a>
                <a href="#/registro" className="home__nav-link home__nav-link--accent">Registrarse</a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Contenido principal ── */}
      <main className="home__main">
        <section className="home__hero">
          <h1 className="home__title">
            Productos <em>disponibles</em>
          </h1>
          <p className="home__subtitle">
            Explorá el catálogo y contactá al vendedor directamente.
          </p>
        </section>

        {/* ── Estado de carga ── */}
        {status === 'loading' && (
          <div className="home__loading" role="status">
            <div className="home__spinner" />
            <p>Cargando productos…</p>
          </div>
        )}

        {/* ── Sin productos (offline) ── */}
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
              <article key={product.id} className="product-card">
                <div className="product-card__image">
                  {product.image ? (
                    <img src={product.image} alt={product.title} />
                  ) : (
                    <span className="product-card__placeholder" aria-hidden="true">🛒</span>
                  )}
                </div>
                <div className="product-card__body">
                  <h3 className="product-card__title">{product.title}</h3>
                  <p className="product-card__desc">{product.description}</p>
                  <div className="product-card__footer">
                    <span className="product-card__price">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    <span className="product-card__seller">@{product.seller}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="home__footer">
        <p>Contactos Verificados — El trato se cierra entre las partes.</p>
      </footer>
    </div>
  );
}
