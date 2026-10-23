import { useEffect, useState } from 'react';
import { fetchProducts } from '../lib/productClient';

/**
 * useProductCatalog(seller)
 *
 * Carga el catálogo público y, si se indica un vendedor, lo filtra.
 * Centraliza el manejo de estados (loading / ready / error / offline)
 * para no repetirlo en Home y Profile.
 */
export function useProductCatalog(seller = null) {
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
        return;
      }

      if (result.ok) {
        const all = result.data?.products ?? [];
        setOffline(false);
        setProducts(seller ? all.filter((p) => p.seller === seller) : all);
        setStatus('ready');
        return;
      }

      setOffline(true);
      setProducts([]);
      setStatus('error');
    }

    load();
    return () => { cancelled = true; };
  }, [seller]);

  return { products, status, offline };
}
