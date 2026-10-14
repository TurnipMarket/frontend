import { useCallback, useState } from 'react';
import { INITIAL_PRODUCT_FORM } from '../lib/productConstants.js';

/**
 * Hook para manejar el estado del formulario de producto.
 * Incluye validaciones y manejo de imágenes.
 */
export function useProductForm() {
  const [form, setForm] = useState(INITIAL_PRODUCT_FORM);
  const [touched, setTouched] = useState({});

  // Validaciones
  const titleValid = form.title.trim().length >= 3 && form.title.trim().length <= 100;
  const descriptionValid = form.description.trim().length >= 10 && form.description.trim().length <= 2000;
  const priceValid = form.price && Number(form.price) > 0 && Number(form.price) <= 999999999;
  const isFormValid = titleValid && descriptionValid && priceValid;

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      title: true,
      description: true,
      price: true,
      category: true,
      condition: true,
    });
  }, []);

  const handleImageChange = useCallback((e, setFeedback, setStatus) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback('Por favor seleccioná una imagen válida.');
      setStatus('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback('La imagen debe ser menor a 5MB.');
      setStatus('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      updateField('imageFile', file);
      updateField('imagePreview', dataUrl);
      setStatus('idle');
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  }, [updateField]);

  const removeImage = useCallback(() => {
    updateField('imageFile', null);
    updateField('imagePreview', null);
  }, [updateField]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_PRODUCT_FORM);
    setTouched({});
  }, []);

  return {
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
  };
}
