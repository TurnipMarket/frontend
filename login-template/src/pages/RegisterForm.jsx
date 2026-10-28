import { registerRequest } from '../lib/registerClient';
import { useAuth } from '../context/AuthContext';
import { useRegisterForm } from '../hooks/useRegisterForm.js';
import { VALIDATION_MESSAGES } from '../lib/validationConstants.js';
import { AvailabilityField } from '../components/auth/AvailabilityField.jsx';
import { PasswordField } from '../components/auth/PasswordField.jsx';
import { VerifyOptions } from '../components/auth/VerifyOptions.jsx';
import { TermsCheckbox } from '../components/auth/TermsCheckbox.jsx';

export function RegisterForm({
  status,
  feedback,
  lastPayload,
  setStatus,
  setFeedback,
  setLastPayload,
}) {
  const { register, setPendingVerification } = useAuth();

  const {
    form,
    touched,
    usernameStatus,
    emailStatus,
    phoneStatus,
    hasContact,
    passwordsMatch,
    verifyOptions,
    isFormValid,
    updateField,
    markTouched,
    markAllTouched,
  } = useRegisterForm();

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
      const result = await registerRequest({
        username: form.username.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        password: form.password,
        verifyBy: form.verifyBy,
      });

      setLastPayload(result.requestPayload);

      if (result.ok) {
        register(result.data);
        setPendingVerification({
          userId: result.data?.user?.id,
          channel: form.verifyBy,
          identifier: form.verifyBy === 'email' ? form.email.trim() : form.phone.trim(),
        });
        setStatus('success');
        setFeedback(result.data?.message ?? 'Cuenta creada.');

        setTimeout(() => {
          window.location.hash = '#/verificar-cuenta';
        }, 800);
      } else {
        setStatus('error');
        setFeedback(result.data?.message ?? 'No pudimos crear tu cuenta.');
      }
    } catch {
      setStatus('error');
      setFeedback('Error de conexión con el servidor.');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <AvailabilityField
        id="username"
        label="Nombre de usuario"
        placeholder="tu_username"
        value={form.username}
        onChange={(v) => updateField('username', v)}
        onBlur={() => markTouched('username')}
        autoComplete="username"
        status={usernameStatus}
        error={VALIDATION_MESSAGES.username}
        hint="Así te van a encontrar otros usuarios."
        touched={touched.username}
        required
      />

      <AvailabilityField
        id="email"
        label="Email"
        type="email"
        placeholder="vos@ejemplo.com"
        value={form.email}
        onChange={(v) => updateField('email', v)}
        onBlur={() => markTouched('email')}
        autoComplete="email"
        status={emailStatus}
        error={VALIDATION_MESSAGES.email}
        touched={touched.email}
      />

      <div className="field-divider">
        <span>y / o</span>
      </div>

      <AvailabilityField
        id="phone"
        label="Teléfono"
        type="tel"
        placeholder="+54 9 11 1234 5678"
        value={form.phone}
        onChange={(v) => updateField('phone', v)}
        onBlur={() => markTouched('phone')}
        autoComplete="tel"
        status={phoneStatus}
        error={VALIDATION_MESSAGES.phone}
        touched={touched.phone}
      />

      {touched.email && touched.phone && !hasContact && (
        <p className="field-hint field-hint--error" style={{ marginTop: -8, marginBottom: 16 }}>
          {VALIDATION_MESSAGES.contact}
        </p>
      )}

      <PasswordField
        id="password"
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        value={form.password}
        onChange={(v) => updateField('password', v)}
        onBlur={() => markTouched('password')}
        error={VALIDATION_MESSAGES.password}
        touched={touched.password}
        required
      />

      <PasswordField
        id="confirmPassword"
        label="Repetir contraseña"
        placeholder="Repetí tu contraseña"
        value={form.confirmPassword}
        onChange={(v) => updateField('confirmPassword', v)}
        onBlur={() => markTouched('confirmPassword')}
        error={VALIDATION_MESSAGES.confirmPassword}
        touched={touched.confirmPassword && !passwordsMatch}
        required
      />

      <VerifyOptions
        options={verifyOptions}
        value={form.verifyBy}
        onChange={(v) => updateField('verifyBy', v)}
      />

      <TermsCheckbox
        checked={form.acceptTerms}
        onChange={(v) => updateField('acceptTerms', v)}
        onBlur={() => markTouched('acceptTerms')}
        error={VALIDATION_MESSAGES.terms}
        touched={touched.acceptTerms}
      />

      <button type="submit" className="submit-btn" disabled={status === 'loading' || status === 'success'}>
        {status === 'loading' ? 'Creando cuenta…' : status === 'success' ? '¡Listo!' : 'Crear cuenta'}
      </button>

      {feedback && (
        <p className={`feedback feedback--${status}`} role="status">
          {feedback}
        </p>
      )}
    </form>
  );
}
