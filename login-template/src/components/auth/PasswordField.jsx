/**
 * Campo de contraseña reutilizable.
 */
export function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  autoComplete = 'new-password',
  error,
  touched,
  minLength = 6,
  required = true,
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <input
        id={id}
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
      />
      {touched && value && error && (
        <p className="field-hint field-hint--error">
          {error}
        </p>
      )}
    </div>
  );
}
