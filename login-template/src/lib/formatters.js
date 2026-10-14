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
