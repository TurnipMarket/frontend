/**
 * Funciones de formato reutilizables.
 */

/**
 * Formatea un precio según la moneda.
 */
export function formatPrice(price, currency) {
  if (currency === 'ARS') {
    return '$ ' + price.toLocaleString('es-AR');
  }
  return `${currency} ${price.toLocaleString()}`;
}

/**
 * Obtiene el nombre visible de un usuario.
 */
export function displayName(user) {
  if (!user) return null;
  return user.username || user.name || user.identifier || (user.email ? user.email.split('@')[0] : null);
}

/**
 * currentUsername(user)
 *
 * Username con el que se identifica al usuario logueado en la app.
 * Nunca devuelve null: si no hay datos, cae en "usuario".
 */
export function currentUsername(user) {
  return displayName(user) ?? 'usuario';
}

/**
 * formatTime(iso)
 *
 * Hora corta (HH:MM) para las burbujas de chat. Devuelve "" si la fecha
 * no es válida, para no romper el render.
 */
export function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * formatRelativeTime(iso)
 *
 * Tiempo relativo corto para la lista de conversaciones
 * ("ahora", "5 min", "3 h", "2 d"). Devuelve "" si la fecha no es válida.
 */
export function formatRelativeTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;

  const days = Math.floor(hours / 24);
  return `${days} d`;
}
