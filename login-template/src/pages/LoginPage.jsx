import { useEffect, useMemo, useState } from 'react';
import { parseHash, safeNext } from '../lib/routes';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { MockPayload, MockBanner } from '../components/auth/MockDebug.jsx';
import { LoginForm } from './LoginForm.jsx';
import { LoginProviders } from './LoginProviders.jsx';
import './LoginPage.css';

const BRAND = {
  title: 'Contactos',
  highlight: 'Verificados',
  tagline:
    'Publicá tus medios de contacto y tus condiciones de pago. El trato se cierra entre las partes, fuera de la plataforma.',
  features: [
    'Verificación por email, SMS o Discord',
    'Vos definís qué medios de pago aceptás',
    'Sin pasarela de pago dentro de la app',
  ],
};

export default function LoginPage() {
  const nextPath = useMemo(() => safeNext(parseHash().params), []);
  const needsAuthNotice = nextPath !== '#/';
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        window.location.hash = nextPath;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status, nextPath]);

  return (
    <AuthLayout brand={BRAND}>
      <div className="login-card">
        <header className="login-card__header">
          <h2>Iniciar sesión</h2>
          <p>Ingresá con tu email, teléfono o usuario verificado.</p>
          {needsAuthNotice && (
            <p className="auth-notice" role="status">
              Iniciá sesión para poder publicar productos.
            </p>
          )}
        </header>

        <LoginForm
          status={status}
          setStatus={setStatus}
          feedback={feedback}
          setFeedback={setFeedback}
          lastPayload={lastPayload}
          setLastPayload={setLastPayload}
        />

        <LoginProviders setStatus={setStatus} setFeedback={setFeedback} />

        <p className="signup-hint">
          ¿No tenés cuenta? <a href="#/registro">Registrate</a>
        </p>

        <MockPayload
          payload={lastPayload}
          summary="Ver JSON que se enviaría (modo sin backend)"
        />
      </div>

      <MockBanner>
        Modo sin backend: no se está llamando a ningún servidor. Editá{' '}
        <code>MOCK_MODE</code> en <code>src/config.js</code> cuando conectes el real.
      </MockBanner>
    </AuthLayout>
  );
}
