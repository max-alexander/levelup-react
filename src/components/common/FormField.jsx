/**
 * Campo de formulario controlado con mensaje de error.
 * as = 'input' | 'select' | 'textarea'. Para select se pasan las opciones como children.
 */
export default function FormField({ label, name, value, onChange, error, as = 'input', type = 'text', required = false, hint, className = '', children, ...rest }) {
  const id = `field-${name}`;
  const control = as === 'select' ? 'form-select' : as === 'input' && type === 'checkbox' ? 'form-check-input' : 'form-control';
  const props = {
    id,
    name,
    onChange,
    className: `${control}${error ? ' is-invalid' : ''}`,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    ...rest
  };
  const errorNode = error && <div id={`${id}-error`} className="invalid-feedback d-block">{error}</div>;

  if (type === 'checkbox') {
    return (
      <div className={`form-check ${className}`}>
        <input type="checkbox" checked={Boolean(value)} {...props} />
        <label htmlFor={id} className="form-check-label">{label}</label>
        {errorNode}
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}{required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {as === 'select' && <select value={value ?? ''} {...props}>{children}</select>}
      {as === 'textarea' && <textarea value={value ?? ''} {...props} />}
      {as === 'input' && <input type={type} value={value ?? ''} {...props} />}
      {hint && !error && <div className="form-text">{hint}</div>}
      {errorNode}
    </div>
  );
}
