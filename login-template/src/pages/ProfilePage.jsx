import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { OfflineBanner } from '../components/layout/OfflineBanner.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { ChatButton } from '../components/chat/ChatButton.jsx';
import { useProductCatalog } from '../hooks/useProductCatalog.js';
import './ProfilePage.css';

export default function ProfilePage({ username }) {
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const { products, status, offline } = useProductCatalog(username);

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

        {status === 'ready' && products.length > 0 ? (
          <div className="profile__products">
            <h2 className="profile__section-title">Publicaciones</h2>
            <ProductGrid
              products={products}
              status={status}
              offline={offline}
              linkToProfile={false}
            />
          </div>
        ) : (
          <ProductGrid
            products={products}
            status={status}
            offline={offline}
            emptyText="Este usuario aún no tiene publicaciones."
            emptyClassName="profile__empty"
            hintClassName="profile__empty-hint"
            linkToProfile={false}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
