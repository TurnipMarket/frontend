/**
 * Grupo de radio buttons para seleccionar la condición del producto.
 */
export function ConditionRadioGroup({
  options,
  value,
  onChange,
  name = 'condition',
  label = 'Condición del producto',
}) {
  return (
    <div className="field">
      <label>{label} *</label>
      <div className="condition-options">
        {options.map((opt) => (
          <label key={opt.id} className="radio-option">
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
    </div>
  );
}
