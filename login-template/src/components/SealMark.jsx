// Sello circular: el elemento de marca de toda la plataforma.
// Representa la idea central del producto -> contactos verificados.
// El texto "CONTACTO · VERIFICADO ·" recorre el borde del círculo.
export default function SealMark({ size = 88 }) {
  const id = 'seal-path';

  return (
    <svg
      className="seal-mark"
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Sello de contacto verificado"
    >
      <defs>
        <path id={id} d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0" />
      </defs>

      <circle cx="100" cy="100" r="96" fill="none" stroke="var(--border)" strokeWidth="1" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="var(--gold)" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="58" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1" />

      <text fill="var(--gold)" fontSize="10.5" letterSpacing="3" fontFamily="var(--font-body)">
        <textPath href={`#${id}`} startOffset="0%">
          CONTACTO VERIFICADO · CONTACTO VERIFICADO ·
        </textPath>
      </text>

      {/* check central */}
      <path
        d="M 76,101 L 92,117 L 126,83"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
