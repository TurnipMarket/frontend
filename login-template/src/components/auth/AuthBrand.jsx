import SealMark from '../SealMark.jsx';

/**
 * Panel de marca compartido por login, registro y verificación.
 */
export function AuthBrand({ title, highlight, tagline, features }) {
  return (
    <section className="login-brand" aria-hidden={false}>
      <div className="login-brand__inner">
        <SealMark />
        <h1 className="login-brand__title">
          {title}
          <br />
          <em>{highlight}</em>
        </h1>
        <p className="login-brand__tagline">{tagline}</p>
        <ul className="login-brand__features">
          {features.map((feature) => (
            <li key={feature}>
              <span className="dot" /> {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
