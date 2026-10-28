import { AUTH_PROVIDERS } from '../config';

export function LoginProviders({ setStatus, setFeedback }) {
  function handleProviderClick(providerId) {
    setStatus('idle');
    setFeedback(`El acceso con "${providerId}" se conecta cuando exista el backend.`);
  }

  return (
    <>
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
    </>
  );
}
