import { CONDITIONS, CURRENCIES, CATEGORIES } from '../lib/productConstants.js';
import { TextField } from '../components/product/TextField.jsx';
import { TextAreaField } from '../components/product/TextAreaField.jsx';
import { SelectField } from '../components/product/SelectField.jsx';
import { ConditionRadioGroup } from '../components/product/ConditionRadioGroup.jsx';
import { ImageUpload } from '../components/product/ImageUpload.jsx';
import './CreateProductPage.css';

export function CreateProductForm({
  form,
  touched,
  titleValid,
  descriptionValid,
  priceValid,
  status,
  feedback,
  updateField,
  markTouched,
  handleImageChange,
  removeImage,
  onSubmit,
  setFeedback,
  setStatus,
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
  );
}
