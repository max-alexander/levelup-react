/** Modal de confirmación controlado por props (show / onConfirm / onCancel). */
export default function ConfirmModal({ show, title = 'Confirmar', message, confirmLabel = 'Confirmar', onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="confirm-icon"><i className="fa-solid fa-triangle-exclamation" /></div>
              <h4 id="confirm-title">{title}</h4>
              <p className="text-secondary">{message}</p>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-soft flex-fill" onClick={onCancel}>Cancelar</button>
                <button type="button" className="btn btn-danger flex-fill" onClick={onConfirm}>{confirmLabel}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
