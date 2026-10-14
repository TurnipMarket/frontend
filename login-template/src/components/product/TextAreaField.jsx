/**
 * Campo de texto largo reutilizable con validación y contador de caracteres.
 */
export function TextAreaField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  rows = 5,
  error,
  hint,
  touched,
  required = true,
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        rows={rows}
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
