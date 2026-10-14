import AvailabilityStatus from '../AvailabilityStatus.jsx';

/**
 * Campo de texto con indicador de disponibilidad.
 */
export function AvailabilityField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  autoComplete,
  status,
  error,
  hint,
  touched,
  required = false,
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <div className="field-with-status">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          required={required}
        />
        <AvailabilityStatus status={status} />
      </div>
      {touched && value && error && (
        <p className="field-hint field-hint--error">
          {error}
        </p>
      )}
      {!touched && !value && hint && (
        <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}
