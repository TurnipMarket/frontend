import { useEffect, useRef, useState } from 'react';
import { verifyCode } from '../lib/verifyClient';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { MockPayload } from '../components/auth/MockDebug.jsx';
import './LoginPage.css';
import './VerifyAccountPage.css';

const CODE_LENGTH = 6;

const CHANNEL_LABELS = {
  email: 'tu email',
  sms: 'tu teléfono',
  discord: 'tu cuenta de Discord',
};

const BRAND = {
  title: 'Verificá tu',
  highlight: 'cuenta',
  tagline:
    'Te enviamos un código de confirmación. Ingresalo para completar el registro.',
  features: [
    'El código expira en unos minutos',
    'Revisá la bandeja de entrada o spam',
    'Sin verificación no podés publicar',
  ],
};

export default function VerifyAccountPage() {
  const { pendingVerification, setPendingVerification, user } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [feedback, setFeedback] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const inputRef = useRef(null);

  const channel = pendingVerification?.channel || 'email';
  const identifier = pendingVerification?.identifier || '';
  const userId = pendingVerification?.userId || user?.id;

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (!pendingVerification) {
      window.location.hash = '#/registro';
    }
  }, [pendingVerification]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (code.trim().length !== CODE_LENGTH) {
      setStatus('error');
      setFeedback(`El código debe tener ${CODE_LENGTH} dígitos.`);
      return;
    }

    setStatus('loading');
    setFeedback(null);

    try {
      const result = await verifyCode({
        userId,
        code: code.trim(),
        channel,
      });

      setLastPayload(result.requestPayload);

      if (result.ok) {
        setStatus('success');
        setFeedback(result.data?.message ?? 'Cuenta verificada correctamente.');
        setPendingVerification(null);

        setTimeout(() => {
          window.location.hash = '#/';
        }, 1200);
      } else {
        setStatus('error');
        setFeedback(result.data?.message ?? 'El código es incorrecto. Probá de nuevo.');
      }
    } catch {
      setStatus('error');
      setFeedback('Error de conexión con el servidor.');
    }
  }

  function handleCodeChange(e) {
    const value = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(value);
    if (status === 'error') {
      setStatus('idle');
      setFeedback(null);
    }
  }

  return (
    <AuthLayout brand={BRAND}>
      <div className="login-card">
          <header className="login-card__header">
            <h2>Código de verificación</h2>
            <p>
              Ingresá el código de {CODE_LENGTH} dígitos que enviamos a{' '}
              <strong>{identifier || CHANNEL_LABELS[channel]}</strong>.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="verify-code">Código</label>
              <input
                ref={inputRef}
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="verify-code-input"
                placeholder={'·'.repeat(CODE_LENGTH)}
                value={code}
                onChange={handleCodeChange}
                maxLength={CODE_LENGTH}
                autoComplete="one-time-code"
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading'
                ? 'Verificando…'
                : status === 'success'
                  ? '¡Verificado!'
                  : 'Verificar'}
            </button>

            {feedback && (
              <p className={`feedback feedback--${status}`} role="status">
                {feedback}
              </p>
            )}
          </form>

          <p className="signup-hint">
            <a href="#/registro">← Volver al registro</a>
          </p>

          <MockPayload
            payload={lastPayload}
            summary="Ver JSON que se enviaría (modo sin backend)"
          />
      </div>
    </AuthLayout>
  );
}
