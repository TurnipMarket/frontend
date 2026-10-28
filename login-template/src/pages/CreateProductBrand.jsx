import SealMark from '../components/SealMark';
import './CreateProductPage.css';

export function CreateProductBrand() {
  return (
    <section className="create-product-brand">
      <div className="create-product-brand__inner">
        <SealMark />
        <h1 className="create-product-brand__title">
          Publicá tu
          <br />
          <em>producto</em>
        </h1>
        <p className="create-product-brand__tagline">
          Mostrá lo que vendés. Incluye fotos, descripción clara y precio. Los compradores te contactarán directamente.
        </p>

        <ul className="create-product-brand__features">
          <li>
            <span className="dot" /> Sin comisiones ni pasarela de pago
          </li>
          <li>
            <span className="dot" /> Vos manejás tus condiciones de venta
          </li>
          <li>
            <span className="dot" /> Publicá tantos productos como quieras
          </li>
        </ul>
      </div>
    </section>
  );
}
