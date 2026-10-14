/**
 * Campo de texto reutilizable con validación y contador de caracteres.
 */
export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  error,
  hint,
  touched,
  required = true,
  type = 'text',
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        required={required}
      />
      {touched && value && maxLength && (
        <p className="field-count">
          {value.length} / {maxLength}
        </p>
      )}
      {touched && error && (
        <p className="field-hint field-hint--error">
          {error}
        </p>
      )}
      {!touched && hint && (
        <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}
