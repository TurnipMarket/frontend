import { useState } from 'react';
import { loginRequest } from '../lib/authClient';
import { useAuth } from '../context/AuthContext';

export function LoginForm({
  status,
  setStatus,
  feedback,
  setFeedback,
  lastPayload,
  setLastPayload,
}) {
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '', remember: false });
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

  return (
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
  );
}
