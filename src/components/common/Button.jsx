/** Botón reutilizable: recibe la etiqueta, el ícono, la variante y el manejador onClick por props. */
export default function Button({ label, onClick, variant = 'primary', icon, type = 'button', disabled = false, className = '', size, ...rest }) {
  const sizeClass = size ? ` btn-${size}` : '';
  return (
    <button type={type} className={`btn btn-${variant}${sizeClass} ${className}`.trim()} onClick={onClick} disabled={disabled} {...rest}>
      {icon && <i className={`fa-solid ${icon} me-2`} aria-hidden="true" />}
      {label}
    </button>
  );
}
