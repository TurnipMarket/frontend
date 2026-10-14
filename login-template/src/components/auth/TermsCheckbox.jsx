/**
 * Checkbox de aceptación de términos.
 */
export function TermsCheckbox({
  checked,
  onChange,
  onBlur,
  error,
  touched,
}) {
  return (
    <>
      <label className="checkbox terms-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
        />
        Acepto los términos y entiendo que los pagos se coordinan fuera de la plataforma.
      </label>
      {touched && !checked && error && (
        <p className="field-hint field-hint--error">{error}</p>
      )}
    </>
  );
}
