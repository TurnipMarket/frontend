import { useEffect, useState } from 'react';
import SealMark from '../components/SealMark';
import { loginRequest } from '../lib/authClient';
import { useAuth } from '../context/AuthContext';
import { AUTH_PROVIDERS, MOCK_MODE } from '../config';
import './LoginPage.css';

const initialForm = { identifier: '', password: '', remember: false };

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [feedback, setFeedback] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setFeedback(null);

    try {
      const result = await loginRequest(form);
      setLastPayload(result.requestPayload);

      if (result.ok) {
        login(result.data);
        setStatus('success');
        setFeedback(result.data?.message ?? 'Listo.');
      } else {
        setStatus('error');
        setFeedback(result.data?.message ?? 'No pudimos iniciar tu sesión.');
      }
    } catch {
      setStatus('error');
      setFeedback('Error de conexión con el servidor.');
    }
  }

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        window.location.hash = '#/';
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status]);

  function handleProviderClick(providerId) {
    setStatus('idle');
    setFeedback(`El acceso con "${providerId}" se conecta cuando exista el backend.`);
  }

  return (
    <div className="login-shell">
      <section className="login-brand" aria-hidden={false}>
        <div className="login-brand__inner">
          <SealMark />
          <h1 className="login-brand__title">
            Contactos
            <br />
            <em>Verificados</em>
          </h1>
          <p className="login-brand__tagline">
            Publicá tus medios de contacto y tus condiciones de pago. El trato se cierra
            entre las partes, fuera de la plataforma.
          </p>

          <ul className="login-brand__features">
            <li>
              <span className="dot" /> Verificación por email, SMS o Discord
            </li>
            <li>
              <span className="dot" /> Vos definís qué medios de pago aceptás
            </li>
            <li>
              <span className="dot" /> Sin pasarela de pago dentro de la app
            </li>
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <header className="login-card__header">
            <h2>Iniciar sesión</h2>
            <p>Ingresá con tu email, teléfono o usuario verificado.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="identifier">Email o teléfono</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="vos@ejemplo.com"
                value={form.identifier}
                onChange={(e) => updateField('identifier', e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <div className="field-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => updateField('remember', e.target.checked)}
                />
                Recordarme
              </label>
              <a className="link-muted" href="#recuperar">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="submit-btn" disabled={status === 'loading' || status === 'success'}>
              {status === 'loading' ? 'Entrando…' : status === 'success' ? '¡Listo!' : 'Entrar'}
            </button>

            {feedback && (
              <p className={`feedback feedback--${status}`} role="status">
                {feedback}
              </p>
            )}
          </form>

          <div className="divider">
            <span>o continuá con</span>
          </div>

          <div className="providers">
            {AUTH_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="provider-btn"
                onClick={() => handleProviderClick(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="signup-hint">
            ¿No tenés cuenta? <a href="#/registro">Registrate</a>
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
