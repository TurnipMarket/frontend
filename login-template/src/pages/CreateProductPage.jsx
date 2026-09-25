import { useCallback, useState } from 'react';
import SealMark from '../components/SealMark';
import { createProduct } from '../lib/createProductClient.js';
import { useAuth } from '../context/AuthContext';
import { MOCK_MODE } from '../config';
import './CreateProductPage.css';

const CONDITIONS = [
  { id: 'new', label: 'Nuevo' },
  { id: 'like_new', label: 'Como nuevo' },
  { id: 'good', label: 'Buen estado' },
  { id: 'fair', label: 'Aceptable' },
];

const CURRENCIES = [
  { id: 'ARS', label: 'Pesos Argentinos (ARS)' },
  { id: 'USD', label: 'Dólares (USD)' },
  { id: 'UYU', label: 'Pesos Uruguayos (UYU)' },
];

const CATEGORIES = [
  { id: 'electronics', label: '📱 Electrónica' },
  { id: 'clothing', label: '👕 Ropa y Accesorios' },
  { id: 'home', label: '🏠 Hogar' },
  { id: 'sports', label: '⚽ Deportes' },
  { id: 'books', label: '📚 Libros' },
  { id: 'vehicles', label: '🚗 Vehículos' },
  { id: 'services', label: '🔧 Servicios' },
  { id: 'other', label: '📦 Otros' },
];

const initialForm = {
  title: '',
  description: '',
  category: 'other',
  price: '',
  currency: 'ARS',
  condition: 'new',
  imageFile: null,
  imagePreview: null,
};

export default function CreateProductPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [feedback, setFeedback] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [touched, setTouched] = useState({});

  // Validaciones
  const titleValid = form.title.trim().length >= 3 && form.title.trim().length <= 100;
  const descriptionValid = form.description.trim().length >= 10 && form.description.trim().length <= 2000;
  const priceValid = form.price && Number(form.price) > 0 && Number(form.price) <= 999999999;
  const isFormValid = titleValid && descriptionValid && priceValid;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  // Manejo de carga de imagen
  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setFeedback('Por favor seleccioná una imagen válida.');
      setStatus('error');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback('La imagen debe ser menor a 5MB.');
      setStatus('error');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      updateField('imageFile', file);
      updateField('imagePreview', dataUrl);
      setStatus('idle');
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    updateField('imageFile', null);
    updateField('imagePreview', null);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Marcar todo como tocado
    setTouched({
      title: true,
      description: true,
      price: true,
      category: true,
      condition: true,
    });

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
        image: form.imagePreview, // base64 o null
      });

      setLastPayload(result.requestPayload);

      if (result.ok) {
        setStatus('success');
        setFeedback(result.data?.message ?? 'Producto publicado.');
        
        // Limpiar formulario después de 1.5s
        setTimeout(() => {
          setForm(initialForm);
          setTouched({});
          setLastPayload(null);
          setStatus('idle');
          setFeedback(null);
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

  const getCategoryLabel = (id) => CATEGORIES.find(c => c.id === id)?.label || id;

  return (
    <div className="create-product-shell">
      {/* ── Panel izquierdo: marca ── */}
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

      {/* ── Panel derecho: formulario ── */}
      <section className="create-product-panel">
        <div className="create-product-card">
          <header className="create-product-card__header">
            <h2>Nuevo producto</h2>
            <p>Completa todos los campos para publicar.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Título ── */}
            <div className="field">
              <label htmlFor="title">Título del producto *</label>
              <input
                id="title"
                type="text"
                placeholder="Ej: Zapatillas Nike Air Max"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                onBlur={() => markTouched('title')}
                maxLength={100}
                required
              />
              {touched.title && form.title && (
                <p className="field-count">
                  {form.title.length} / 100
                </p>
              )}
              {touched.title && !titleValid && (
                <p className="field-hint field-hint--error">
                  Entre 3 y 100 caracteres.
                </p>
              )}
              {!touched.title || !form.title ? (
                <p className="field-hint">Sé específico para que otros lo encuentren.</p>
              ) : null}
            </div>

            {/* ── Descripción ── */}
            <div className="field">
              <label htmlFor="description">Descripción *</label>
              <textarea
                id="description"
                placeholder="Describe el producto: características, estado, razón de venta, etc."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                onBlur={() => markTouched('description')}
                maxLength={2000}
                rows={5}
                required
              />
              {touched.description && form.description && (
                <p className="field-count">
                  {form.description.length} / 2000
                </p>
              )}
              {touched.description && !descriptionValid && (
                <p className="field-hint field-hint--error">
                  Entre 10 y 2000 caracteres.
                </p>
              )}
            </div>

            {/* ── Categoría ── */}
            <div className="field">
              <label htmlFor="category">Categoría *</label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-divider">
              <span>Precio</span>
            </div>

            {/* ── Precio y Moneda ── */}
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
              <div className="field">
                <label htmlFor="currency">Moneda *</label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  required
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.id} value={curr.id}>
                      {curr.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-divider">
              <span>Detalles</span>
            </div>

            {/* ── Condición ── */}
            <div className="field">
              <label>Condición del producto *</label>
              <div className="condition-options">
                {CONDITIONS.map((cond) => (
                  <label key={cond.id} className="radio-option">
                    <input
                      type="radio"
                      name="condition"
                      value={cond.id}
                      checked={form.condition === cond.id}
                      onChange={() => updateField('condition', cond.id)}
                    />
                    {cond.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Imagen ── */}
            <div className="field">
              <label>Foto del producto</label>
              
              {form.imagePreview ? (
                <div className="image-preview">
                  <img src={form.imagePreview} alt="Preview" />
                  <div className="image-preview__actions">
                    <button
                      type="button"
                      className="image-preview__remove"
                      onClick={removeImage}
                    >
                      ✕ Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="image-upload">
                  <div className="image-upload__input-wrapper">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload__input"
                    />
                    <label htmlFor="image" className="image-upload__label">
                      <span className="image-upload__icon">📷</span>
                      <span className="image-upload__text">
                        Seleccioná una foto
                      </span>
                      <span className="image-upload__hint">
                        JPG, PNG o WebP (máx 5MB)
                      </span>
                    </label>
                  </div>
                </div>
              )}
              <p className="field-hint">
                Una buena foto aumenta las chances de venta.
              </p>
            </div>

            {/* ── Botón submit ── */}
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