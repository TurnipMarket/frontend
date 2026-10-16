import { useAuth } from '../../context/AuthContext';
import { loginHrefFor } from '../../lib/routes';
import './chat.css';

export function ChatButton({
  seller,
  productId = null,
  productTitle = null,
  label = '💬 Chatear',
  className = '',
}) {
  const { isAuthenticated } = useAuth();

  const params = new URLSearchParams();

  if (productId != null) {
    params.set('productId', String(productId));
  }

  if (productTitle) {
    params.set('productTitle', productTitle);
  }

  const query = params.toString();

  const destination =
    `#/mensajes/${encodeURIComponent(seller)}` +
    (query ? `?${query}` : '');

  const href = isAuthenticated
    ? destination
    : loginHrefFor(destination);

  return (
    <a
      href={href}
      className={
        className
          ? `${className} chat-button`
          : 'chat-button'
      }
    >
      {label}
    </a>
  );
}