/**
 * Campo de selección reutilizable.
 */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required = true,
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
