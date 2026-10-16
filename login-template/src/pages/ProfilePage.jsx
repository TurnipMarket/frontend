import { useEffect, useState } from 'react';
import { fetchProducts } from '../lib/productClient';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { OfflineBanner } from '../components/layout/OfflineBanner.jsx';
import { LoadingSpinner } from '../components/layout/LoadingSpinner.jsx';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { ChatButton } from '../components/chat/ChatButton.jsx';
import './ProfilePage.css';

export default function ProfilePage({ username }) {
  const { user: currentUser, isAuthenticated, logout } = useAuth();
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
        const allProducts = result.data?.products ?? [];
        const userProducts = allProducts.filter(
          (p) => p.seller === username
        );
        setProducts(userProducts);
        setStatus('ready');
      } else {
        setOffline(true);
        setProducts([]);
        setStatus('error');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [username]);

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <div className="profile">
      {offline && <OfflineBanner />}
      
      <Header 
        user={currentUser} 
        isAuthenticated={isAuthenticated} 
        logout={logout} 
      />

      <main className="profile__main">
        <section className="profile__info">
          <div className="profile__avatar">
            <span className="profile__avatar-text">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="profile__details">
            <h1 className="profile__username">@{username}</h1>
            {isOwnProfile && (
              <span className="profile__badge">Tu perfil</span>
            )}
            <p className="profile__stats">
              {products.length} {products.length === 1 ? 'publicación' : 'publicaciones'}
            </p>
            {!isOwnProfile && (
              <ChatButton
                seller={username}
                label="💬 Chatear"
                className="profile__chat-btn"
              />
            )}
          </div>
        </section>

        {status === 'loading' && <LoadingSpinner message="Cargando publicaciones…" />}

        {status === 'error' && offline && (
          <div className="profile__empty">
            <p>No hay productos para mostrar en este momento.</p>
            <p className="profile__empty-hint">Intentá de nuevo más tarde cuando el servidor esté disponible.</p>
          </div>
        )}

        {status === 'ready' && products.length === 0 && (
          <div className="profile__empty">
            <p>Este usuario aún no tiene publicaciones.</p>
          </div>
        )}

        {status === 'ready' && products.length > 0 && (
          <div className="profile__products">
            <h2 className="profile__section-title">Publicaciones</h2>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} linkToProfile={false} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
