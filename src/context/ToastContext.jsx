import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ToastContext = createContext({ notify: () => {} });

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((title, message = '', type = 'info') => {
    setToast({ title, message, type, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite">
        {toast && (
          <div key={toast.key} className="toast show" role="status" data-type={toast.type}>
            <div className="toast-header">
              <i className={`fa-solid ${toast.type === 'danger' ? 'fa-circle-exclamation' : toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-info'} me-2`} />
              <strong className="me-auto">{toast.title}</strong>
              <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={() => setToast(null)} />
            </div>
            {toast.message && <div className="toast-body">{toast.message}</div>}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
