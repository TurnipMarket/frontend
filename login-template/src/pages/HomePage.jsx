import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { OfflineBanner } from '../components/layout/OfflineBanner.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { useProductCatalog } from '../hooks/useProductCatalog.js';
import './HomePage.css';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { products, status, offline } = useProductCatalog();

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

        <ProductGrid
          products={products}
          status={status}
          offline={offline}
          emptyText="No hay productos publicados aún."
        />
      </main>

      <Footer />
    </div>
  );
}
