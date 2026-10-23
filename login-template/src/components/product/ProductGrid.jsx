import { LoadingSpinner } from '../layout/LoadingSpinner.jsx';
import { ProductCard } from './ProductCard.jsx';

/**
 * ProductGrid
 *
 * Renderiza el estado del catálogo: carga, error/offline, vacío o la
 * grilla de publicaciones. Evita duplicar ese bloque en Home y Profile.
 */
export function ProductGrid({
  products,
  status,
  offline,
  emptyText,
  emptyClassName = 'home__empty',
  hintClassName = 'home__empty-hint',
  loadingMessage = 'Cargando productos…',
  linkToProfile = true,
}) {
  if (status === 'loading') {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (status === 'error') {
    return (
      <div className={emptyClassName}>
        <p>No hay productos para mostrar en este momento.</p>
        {offline && (
          <p className={hintClassName}>
            Intentá de nuevo más tarde cuando el servidor esté disponible.
          </p>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={emptyClassName}>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          linkToProfile={linkToProfile}
        />
      ))}
    </div>
  );
}
