import { useState } from 'react';

const LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

/**
 * Selector de estrellas accesible (radiogroup): clic, hover y flechas del teclado.
 * Componente controlado: el valor llega por props y los cambios salen por onChange.
 */
export default function StarRatingInput({ value, onChange, error }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  const handleKeyDown = event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(1, (value || 1) - 1));
    }
  };

  return (
    <div>
      <div className="star-input" role="radiogroup" aria-label="Calificación" aria-invalid={Boolean(error)} onKeyDown={handleKeyDown} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
            tabIndex={value ? (value === star ? 0 : -1) : (star === 1 ? 0 : -1)}
            className={star <= shown ? 'on' : ''}
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
          >
            <i className={`fa-${star <= shown ? 'solid' : 'regular'} fa-star`} aria-hidden="true" />
          </button>
        ))}
        <span className="star-input-label">{LABELS[shown] || 'Elige una calificación'}</span>
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
