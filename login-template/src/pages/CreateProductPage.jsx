import { useCallback, useState } from 'react';
import SealMark from '../components/SealMark';
import { createProduct } from '../lib/createProductClient.js';
import { useAuth } from '../context/AuthContext';
import { MOCK_MODE } from '../config';
import { useProductForm } from '../hooks/useProductForm.js';
import { CONDITIONS, CURRENCIES, CATEGORIES } from '../lib/productConstants.js';
import { TextField } from '../components/product/TextField.jsx';
import { TextAreaField } from '../components/product/TextAreaField.jsx';
import { SelectField } from '../components/product/SelectField.jsx';
import { ConditionRadioGroup } from '../components/product/ConditionRadioGroup.jsx';
import { ImageUpload } from '../components/product/ImageUpload.jsx';
import { displayName } from '../lib/formatters.js';
import './CreateProductPage.css';

export default function CreateProductPage() {
  const { user, token, logout } = useAuth();
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  const {
    form,
    touched,
    titleValid,
    descriptionValid,
    priceValid,
    isFormValid,
    updateField,
    markTouched,
    markAllTouched,
    handleImageChange,
    removeImage,
    resetForm,
  } = useProductForm();

  const handleLogout = useCallback(() => {
    window.location.hash = '#/';
    logout();
  }, [logout]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    markAllTouched();

    if (!isFormValid) {
      setStatus('error');
      setFeedback('Revisá los campos marcados antes de continuar.');
      return;
    }

    setStatus('loading');
    setFeedback(null);

    try {
      const result = await createProduct({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        currency: form.currency,
        condition: form.condition,
        image: form.imagePreview,
      }, token);

      setLastPayload(result.requestPayload);

      if (result.ok) {
        setStatus('success');
        setFeedback(result.data?.message ?? 'Producto publicado.');
        
        setTimeout(() => {
          resetForm();
          setStatus('idle');
          setFeedback(null);
          setLastPayload(null);
        }, 1500);
      } else {
        setStatus('error');
        setFeedback(result.data?.message ?? 'No pudimos publicar tu producto.');
      }
    } catch {
      setStatus('error');
      setFeedback('Error de conexión con el servidor.');
    }
  }

  return (
    <div className="create-product-shell">
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

      <section className="create-product-panel">
        <div className="create-product-card">
          <header className="create-product-card__header">
            <h2>Nuevo producto</h2>
            <p>Completa todos los campos para publicar.</p>
            <p className="create-product-card__session">
              Publicando como <strong>{displayName(user) ?? 'usuario'}</strong>
              <button type="button" onClick={handleLogout} className="create-product-card__logout">
                Salir
              </button>
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              id="title"
              label="Título del producto"
              value={form.title}
              onChange={(v) => updateField('title', v)}
              onBlur={() => markTouched('title')}
              placeholder="Ej: Zapatillas Nike Air Max"
              maxLength={100}
              error="Entre 3 y 100 caracteres."
              hint="Sé específico para que otros lo encuentren."
              touched={touched.title}
              required
            />

            <TextAreaField
              id="description"
              label="Descripción"
              value={form.description}
              onChange={(v) => updateField('description', v)}
              onBlur={() => markTouched('description')}
              placeholder="Describe el producto: características, estado, razón de venta, etc."
              maxLength={2000}
              error="Entre 10 y 2000 caracteres."
              touched={touched.description}
              required
            />

            <SelectField
              id="category"
              label="Categoría"
              value={form.category}
              onChange={(v) => updateField('category', v)}
              options={CATEGORIES}
              required
            />

            <div className="field-divider">
              <span>Precio</span>
            </div>

            <div className="field-row">
              <div className="field field-grow">
                <label htmlFor="price">Precio *</label>
                <input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  onBlur={() => markTouched('price')}
                  step="0.01"
                  min="0"
                  required
                />
                {touched.price && !priceValid && (
                  <p className="field-hint field-hint--error">
                    Ingresá un precio válido.
                  </p>
                )}
              </div>
              <SelectField
                id="currency"
                label="Moneda"
                value={form.currency}
                onChange={(v) => updateField('currency', v)}
                options={CURRENCIES}
                required
              />
            </div>

            <div className="field-divider">
              <span>Detalles</span>
            </div>

            <ConditionRadioGroup
              options={CONDITIONS}
              value={form.condition}
              onChange={(v) => updateField('condition', v)}
            />

            <ImageUpload
              imagePreview={form.imagePreview}
              onImageChange={(e) => handleImageChange(e, setFeedback, setStatus)}
              onRemoveImage={removeImage}
            />

            <button type="submit" className="submit-btn" disabled={status === 'loading' || status === 'success'}>
              {status === 'loading' ? 'Publicando…' : status === 'success' ? '¡Publicado!' : 'Publicar producto'}
            </button>

            {feedback && (
              <p className={`feedback feedback--${status}`} role="status">
                {feedback}
              </p>
            )}
          </form>

          <p className="back-link">
            ← <a href="#/">Volver al catálogo</a>
          </p>

          {MOCK_MODE && lastPayload && (
            <details className="debug-payload">
              <summary>Ver JSON que se enviaría (modo sin backend)</summary>
              <pre>{JSON.stringify(lastPayload, null, 2)}</pre>
            </details>
          )}
        </div>

        {MOCK_MODE && (
          <p className="mock-banner">
            Modo sin backend: no se está llamando a ningún servidor. Editá{' '}
            <code>MOCK_MODE</code> en <code>src/config.js</code> cuando conectes el real.
          </p>
        )}
      </section>
    </div>
  );
}
