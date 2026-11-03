import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Stars from '../common/Stars';
import AlertMessage from '../common/AlertMessage';
import StarRatingInput from './StarRatingInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { reviewService, summarizeReviews, validateReview, REVIEW_MAX } from '../../services/reviewService';
import { formatDate } from '../../utils/format';

/** Promedio grande + barras de distribución (presentacional). */
export function ReviewSummary({ summary }) {
  return (
    <div className="review-summary">
      <div className="text-center">
        <strong className="review-average" data-testid="review-average">{summary.count ? summary.average.toFixed(1) : '—'}</strong>
        <Stars rating={summary.average} />
        <small className="d-block text-secondary mt-1">{summary.count} {summary.count === 1 ? 'reseña' : 'reseñas'}</small>
      </div>
      <div className="review-bars">
        {[5, 4, 3, 2, 1].map(star => {
          const percent = summary.count ? Math.round((summary.distribution[star] / summary.count) * 100) : 0;
          return (
            <div className="review-bar" key={star}>
              <span>{star} <i className="fa-solid fa-star" aria-hidden="true" /></span>
              <div className="progress" role="progressbar" aria-label={`${star} estrellas: ${percent}%`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-bar" style={{ width: `${percent}%` }} />
              </div>
              <small>{summary.distribution[star]}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Lista de reseñas (renderizado de listas + estado vacío). */
export function ReviewList({ reviews }) {
  if (!reviews.length) return <p className="text-secondary mb-0">Este juego aún no tiene reseñas. ¡Sé el primero en opinar!</p>;
  return (
    <ul className="review-list" aria-label="Reseñas de clientes">
      {reviews.map(review => (
        <li key={review.id} className="review-item" data-testid="review-item">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="review-avatar" aria-hidden="true">{review.userName.charAt(0)}</span>
              <strong>{review.userName}</strong>
            </div>
            <small className="text-secondary">{formatDate(review.date)}</small>
          </div>
          <div className="my-1"><Stars rating={review.rating} /></div>
          <p className="mb-0">{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}

/** Formulario de reseña: estado propio y validación; entrega los datos por onSubmit. */
export function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = event => {
    event.preventDefault();
    const found = validateReview({ rating, comment });
    setErrors(found);
    if (Object.keys(found).length) return;
    const ok = onSubmit({ rating, comment });
    if (ok !== false) {
      setRating(0);
      setComment('');
    }
  };

  return (
    <form className="review-form" noValidate onSubmit={handleSubmit}>
      <h5 className="mb-2">Escribe tu reseña</h5>
      <StarRatingInput value={rating} onChange={value => { setRating(value); setErrors(current => ({ ...current, rating: undefined })); }} error={errors.rating} />
      <label htmlFor="review-comment" className="form-label mt-3">Comentario</label>
      <textarea id="review-comment" name="comment" rows={3} maxLength={REVIEW_MAX} className={`form-control${errors.comment ? ' is-invalid' : ''}`} placeholder="¿Qué te pareció el juego?"
        value={comment} onChange={event => { setComment(event.target.value); setErrors(current => ({ ...current, comment: undefined })); }} />
      <div className="d-flex justify-content-between mt-1">
        {errors.comment ? <div className="invalid-feedback d-block">{errors.comment}</div> : <span />}
        <small className="text-secondary">{comment.length}/{REVIEW_MAX}</small>
      </div>
      <button type="submit" className="btn btn-primary mt-2">Publicar reseña</button>
    </form>
  );
}

/** Contenedor: conecta las reseñas de un juego con la BD y la sesión. */
export default function ProductReviews({ gameId }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  const all = useCollection(db.reviews);
  const [error, setError] = useState('');
  const reviews = reviewService.byGame(gameId, all);
  const summary = summarizeReviews(reviews);
  const alreadyReviewed = user && reviews.some(review => review.userId === user.id);

  const handleSubmit = data => {
    setError('');
    try {
      reviewService.add({ gameId, user, ...data });
      notify('Reseña publicada', '¡Gracias por tu opinión!', 'success');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return (
    <section className="surface-card mb-5" aria-labelledby="reviews-title">
      <h3 id="reviews-title" className="mb-4">Opiniones de clientes</h3>
      <div className="row g-4">
        <div className="col-lg-4">
          <ReviewSummary summary={summary} />
          <div className="mt-4">
            <AlertMessage message={error} onClose={() => setError('')} />
            {!user && (
              <p className="text-secondary mb-0">
                <Link to="/login" state={{ from: location.pathname }}>Inicia sesión</Link> para dejar una reseña.
              </p>
            )}
            {user && alreadyReviewed && <p className="text-secondary mb-0"><i className="fa-solid fa-circle-check text-success me-2" />Ya publicaste tu reseña de este juego.</p>}
            {user && !alreadyReviewed && <ReviewForm onSubmit={handleSubmit} />}
          </div>
        </div>
        <div className="col-lg-8">
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </section>
  );
}
