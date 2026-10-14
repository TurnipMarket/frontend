/**
 * Componente de subida de imagen con preview.
 */
export function ImageUpload({
  imagePreview,
  onImageChange,
  onRemoveImage,
}) {
  return (
    <div className="field">
      <label>Foto del producto</label>
      
      {imagePreview ? (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
          <div className="image-preview__actions">
            <button
              type="button"
              className="image-preview__remove"
              onClick={onRemoveImage}
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
              onChange={onImageChange}
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
  );
}
