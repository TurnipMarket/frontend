import { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout.jsx';
import { MockPayload, MockBanner } from '../components/auth/MockDebug.jsx';
import { RegisterForm } from './RegisterForm.jsx';
import './LoginPage.css';
import './RegisterPage.css';

const BRAND = {
  title: 'Creá tu',
  highlight: 'cuenta verificada',
  tagline:
    'Elegí un nombre de usuario único, sumá un email o teléfono de contacto y verificalo. Recién ahí vas a poder publicar tus servicios.',
  features: [
    'Username único en toda la plataforma',
    'Email y/o teléfono, a tu elección',
    'Verificación obligatoria antes de publicar',
  ],
};

export default function RegisterPage() {
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  return (
    <AuthLayout brand={BRAND}>
      <div className="login-card register-card">
        <header className="login-card__header">
          <h2>Registrarse</h2>
          <p>Todos los campos con * son obligatorios.</p>
        </header>

        <RegisterForm
          status={status}
          feedback={feedback}
          lastPayload={lastPayload}
          setStatus={setStatus}
          setFeedback={setFeedback}
          setLastPayload={setLastPayload}
        />

        <p className="signup-hint">
          ¿Ya tenés cuenta? <a href="#/">Iniciá sesión</a>
        </p>

        <MockPayload
          payload={lastPayload}
          summary="Ver JSON que se enviaría (modo sin backend)"
        />
      </div>

      <MockBanner>
        La verificación de unicidad es simulada contra una lista fija en{' '}
        <code>src/config.js</code>. El backend real es el único que puede garantizarla
        de verdad — conectalo en <code>src/lib/registerClient.js</code>.
      </MockBanner>
    </AuthLayout>
  );
}
