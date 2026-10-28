import { useCallback, useState } from 'react';
import { createProduct } from '../lib/createProductClient.js';
import { useAuth } from '../context/AuthContext';
import { useProductForm } from '../hooks/useProductForm.js';
import { CreateProductBrand } from './CreateProductBrand.jsx';
import { CreateProductHeader } from './CreateProductHeader.jsx';
import { CreateProductForm } from './CreateProductForm.jsx';
import { CreateProductDebug, CreateProductMockBanner } from './CreateProductDebug.jsx';
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
      <CreateProductBrand />

      <section className="create-product-panel">
        <div className="create-product-card">
          <CreateProductHeader user={user} onLogout={handleLogout} />

          <CreateProductForm
            form={form}
            touched={touched}
            titleValid={titleValid}
            descriptionValid={descriptionValid}
            priceValid={priceValid}
            status={status}
            feedback={feedback}
            updateField={updateField}
            markTouched={markTouched}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            onSubmit={handleSubmit}
            setFeedback={setFeedback}
            setStatus={setStatus}
          />

          <p className="back-link">
            ← <a href="#/">Volver al catálogo</a>
          </p>

          <CreateProductDebug lastPayload={lastPayload} />
        </div>

        <CreateProductMockBanner />
      </section>
    </div>
  );
}
