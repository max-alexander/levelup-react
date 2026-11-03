/**
 * Indicador de pasos. Los pasos ya completados se pueden volver a abrir con onStepClick.
 * steps = [{ label, icon }], current = índice del paso activo.
 */
export default function Stepper({ steps, current, onStepClick }) {
  return (
    <ol className="stepper" aria-label="Progreso de la compra">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : 'pending';
        const content = (
          <>
            <span className="stepper-dot" aria-hidden="true">
              {state === 'done' ? <i className="fa-solid fa-check" /> : <i className={`fa-solid ${step.icon}`} />}
            </span>
            <span className="stepper-label"><small>Paso {index + 1}</small>{step.label}</span>
          </>
        );
        return (
          <li key={step.label} className={`stepper-item ${state}`} aria-current={state === 'active' ? 'step' : undefined}>
            {state === 'done' && onStepClick
              ? <button type="button" className="stepper-btn" onClick={() => onStepClick(index)} aria-label={`Volver al paso ${index + 1}: ${step.label}`}>{content}</button>
              : <div className="stepper-btn">{content}</div>}
          </li>
        );
      })}
    </ol>
  );
}
