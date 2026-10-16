import { useAuth } from '../../context/AuthContext';
import './chat.css';

/**
 * ChatButton
 *
 * Botón "Chatear" que abre (o crea) la conversación con un vendedor.
 * Requiere sesión: si el usuario no está logueado, lo lleva al login.
 */
export function ChatButton({ seller, productId = null, productTitle = null, label = '💬 Chatear', className = '' }) {
  const { isAuthenticated } = useAuth();

  const params = new URLSearchParams();
  if (productId) params.set('productId', productId);
  if (productTitle) params.set('productTitle', productTitle);

  const query = params.toString();
  const href = isAuthenticated
    ? `#/mensajes/${encodeURIComponent(seller)}${query ? `?${query}` : ''}`
    : '#/login';

  return (
    <a href={href} className={className ? `${className} chat-button` : 'chat-button'}>
      {label}
    </a>
  );
}
