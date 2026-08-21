import { useMemo, useState } from 'react';
import SealMark from '../components/SealMark';
import AvailabilityStatus from '../components/AvailabilityStatus';
import { useAvailability } from '../useAvailability';
import { registerRequest } from '../lib/registerClient';
import { MOCK_MODE } from '../config';
import './LoginPage.css';
import './RegisterPage.css';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{8,15}$/;

const initialForm = {
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  verifyBy: 'email',
  acceptTerms: false,
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [feedback, setFeedback] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [touched, setTouched] = useState({});

  const usernameStatus = useAvailability('username', form.username, {
    validate: (v) => USERNAME_RE.test(v),
  });
  const emailStatus = useAvailability('email', form.email, {
    validate: (v) => EMAIL_RE.test(v),
  });
  const phoneStatus = useAvailability('phone', form.phone, {
    validate: (v) => PHONE_RE.test(v),
  });

  const hasContact = form.email.trim() || form.phone.trim();
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  const canVerifyByEmail = form.email.trim() && emailStatus !== 'taken' && emailStatus !== 'invalid';
  const canVerifyBySms = form.phone.trim() && phoneStatus !== 'taken' && phoneStatus !== 'invalid';

  const verifyOptions = useMemo(() => {
    const opts = [];
    if (canVerifyByEmail) opts.push({ id: 'email', label: 'Email' });
    if (canVerifyBySms) opts.push({ id: 'sms', label: 'SMS' });
    opts.push({ id: 'discord', label: 'Discord' });
    return opts;
  }, [canVerifyByEmail, canVerifyBySms]);

  const isFormValid =
    USERNAME_RE.test(form.username) &&
    usernameStatus === 'available' &&
    hasContact &&
    (!form.email.trim() || (EMAIL_RE.test(form.email) && emailStatus !== 'taken')) &&
    (!form.phone.trim() || (PHONE_RE.test(form.phone) && phoneStatus !== 'taken')) &&
    form.password.length >= 6 &&
    passwordsMatch &&
    form.acceptTerms;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    });

    if (!isFormValid) {
      setStatus('error');
      setFeedback('Revisá los campos marcados antes de continuar.');
      return;
    }

    setStatus('loading');
    setFeedback(null);

    const result = await registerRequest({
      username: form.username.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      password: form.password,
      verifyBy: form.verifyBy,
    });

    setLastPayload(result.requestPayload);

    if (result.ok) {
      setStatus('success');
      setFeedback(result.data?.message ?? 'Cuenta creada.');
    } else {
      setStatus('error');
      setFeedback(result.data?.message ?? 'No pudimos crear tu cuenta.');
    }
  }

  return (
    <div className="login-shell">
      <section className="login-brand">
        <div className="login-brand__inner">
          <SealMark />
          <h1 className="login-brand__title">
            Creá tu
            <br />
            <em>cuenta verificada</em>
          </h1>
          <p className="login-brand__tagline">
            Elegí un nombre de usuario único, sumá un email o teléfono de contacto y
            verificalo. Recién ahí vas a poder publicar tus servicios.
          </p>

          <ul className="login-brand__features">
            <li>
              <span className="dot" /> Username único en toda la plataforma
            </li>
            <li>
              <span className="dot" /> Email y/o teléfono, a tu elección
            </li>
            <li>
              <span className="dot" /> Verificación obligatoria antes de publicar
            </li>
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card register-card">
          <header className="login-card__header">
            <h2>Registrarse</h2>
            <p>Todos los campos con * son obligatorios.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Nombre de usuario *</label>
              <div className="field-with-status">
                <input
                  id="username"
                  type="text"
                  placeholder="tu_usuario"
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  onBlur={() => markTouched('username')}
                  autoComplete="username"
                  required
                />
                <AvailabilityStatus status={usernameStatus} />
              </div>
              {touched.username && form.username && !USERNAME_RE.test(form.username) && (
                <p className="field-hint field-hint--error">
                  3 a 20 caracteres: letras, números o guion bajo.
                </p>
              )}
              {!touched.username || !form.username ? (
                <p className="field-hint">Así te van a encontrar otros usuarios.</p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="field-with-status">
                <input
                  id="email"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                  autoComplete="email"
                />
                <AvailabilityStatus status={emailStatus} />
              </div>
              {touched.email && form.email && !EMAIL_RE.test(form.email) && (
                <p className="field-hint field-hint--error">Ingresá un email válido.</p>
              )}
            </div>

            <div className="field-divider">
              <span>y / o</span>
            </div>

            <div className="field">
              <label htmlFor="phone">Teléfono</label>
              <div className="field-with-status">
                <input
                  id="phone"
                  type="tel"
                  placeholder="+54 9 11 1234 5678"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  onBlur={() => markTouched('phone')}
                  autoComplete="tel"
                />
                <AvailabilityStatus status={phoneStatus} />
              </div>
              {touched.phone && form.phone && !PHONE_RE.test(form.phone) && (
                <p className="field-hint field-hint--error">
                  Incluí código de país, solo números (8 a 15 dígitos).
                </p>
              )}
            </div>

            {touched.email && touched.phone && !hasContact && (
              <p className="field-hint field-hint--error" style={{ marginTop: -8, marginBottom: 16 }}>
                Necesitás cargar al menos un email o un teléfono.
              </p>
            )}

            <div className="field">
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                onBlur={() => markTouched('password')}
                autoComplete="new-password"
                minLength={6}
                required
              />
              {touched.password && form.password && form.password.length < 6 && (
                <p className="field-hint field-hint--error">Usá al menos 6 caracteres.</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Repetir contraseña *</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repetí tu contraseña"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                onBlur={() => markTouched('confirmPassword')}
                autoComplete="new-password"
                required
              />
              {touched.confirmPassword && form.confirmPassword && !passwordsMatch && (
                <p className="field-hint field-hint--error">Las contraseñas no coinciden.</p>
              )}
            </div>

            <div className="field">
              <label>Verificar cuenta por *</label>
              <div className="verify-options">
                {verifyOptions.map((opt) => (
                  <label key={opt.id} className="verify-option">
                    <input
                      type="radio"
                      name="verifyBy"
                      value={opt.id}
                      checked={form.verifyBy === opt.id}
                      onChange={() => updateField('verifyBy', opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <p className="field-hint">
                Vas a recibir un código o link para confirmar este canal después de crear la cuenta.
              </p>
            </div>

            <label className="checkbox terms-checkbox">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => updateField('acceptTerms', e.target.checked)}
                onBlur={() => markTouched('acceptTerms')}
              />
              Acepto los términos y entiendo que los pagos se coordinan fuera de la plataforma.
            </label>
            {touched.acceptTerms && !form.acceptTerms && (
              <p className="field-hint field-hint--error">Tenés que aceptar los términos.</p>
            )}

            <button type="submit" className="submit-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>

            {feedback && (
              <p className={`feedback feedback--${status}`} role="status">
                {feedback}
              </p>
            )}
          </form>

          <p className="signup-hint">
            ¿Ya tenés cuenta? <a href="#/">Iniciá sesión</a>
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
            La verificación de unicidad es simulada contra una lista fija en{' '}
            <code>src/config.js</code>. El backend real es el único que puede garantizarla
            de verdad — conectalo en <code>src/lib/registerClient.js</code>.
          </p>
        )}
      </section>
    </div>
  );
}
