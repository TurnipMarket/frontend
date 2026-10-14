/**
 * Grupo de opciones de verificación de cuenta.
 */
export function VerifyOptions({
  options,
  value,
  onChange,
  name = 'verifyBy',
}) {
  return (
    <div className="field">
      <label>Verificar cuenta por *</label>
      <div className="verify-options">
        {options.map((opt) => (
          <label key={opt.id} className="verify-option">
            <input
              type="radio"
              name={name}
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <p className="field-hint">
        Vas a recibir un código o link para confirmar este canal después de crear la cuenta.
      </p>
    </div>
  );
}
