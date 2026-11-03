/** Muestra un mensaje solo cuando existe (renderizado condicional). */
export default function AlertMessage({ message, type = 'danger', onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} d-flex align-items-start gap-2`} role="alert">
      <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} mt-1`} aria-hidden="true" />
      <span className="flex-grow-1">{message}</span>
      {onClose && <button type="button" className="btn-close" aria-label="Cerrar alerta" onClick={onClose} />}
    </div>
  );
}
