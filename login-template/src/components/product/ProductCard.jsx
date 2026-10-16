import { formatPrice } from '../../lib/formatters.js';
import { useAuth } from '../../context/AuthContext';
import { ChatButton } from '../chat/ChatButton.jsx';
import './ProductCard.css';

/**
 * ProductCard
 *
 * Tarjeta de publicación. El cuerpo (imagen, título, descripción y precio)
 * enlaza al perfil del vendedor; el botón "Chatear" abre la conversación
 * con él. Extraída de HomePage/ProfilePage para no duplicar el markup.
 */
export function ProductCard({ product, linkToProfile = true }) {
  const { isAuthenticated } = useAuth();
  const profileHref = `#/perfil/${encodeURIComponent(product.seller)}`;

  const content = (
    <>
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
    </>
  );

  return (
    <article className="product-card">
      {linkToProfile ? (
        <a className="product-card__link" href={profileHref}>
          {content}
        </a>
      ) : (
        <div className="product-card__main">{content}</div>
      )}
      <div className="product-card__actions">
        <ChatButton
          seller={product.seller}
          productId={product.id}
          productTitle={product.title}
          className={isAuthenticated ? '' : 'chat-button--outline'}
        />
      </div>
    </article>
  );
}
