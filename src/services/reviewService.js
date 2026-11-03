// Reseñas de clientes: validación, resumen (promedio y distribución) y CRUD sobre db.reviews.
import { db } from '../data/db';
import { sanitizeText } from '../utils/format';

export const REVIEW_MIN = 10;
export const REVIEW_MAX = 300;

/** Valida una reseña y devuelve { campo: mensaje } solo con los errores presentes. */
export function validateReview({ rating, comment }) {
  const errors = {};
  const stars = Number(rating);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) errors.rating = 'Elige entre 1 y 5 estrellas.';
  const length = sanitizeText(comment).length;
  if (length < REVIEW_MIN || length > REVIEW_MAX) errors.comment = `El comentario debe tener entre ${REVIEW_MIN} y ${REVIEW_MAX} caracteres.`;
  return errors;
}

/** Promedio con un decimal, cantidad y distribución { 5: n, 4: n, ... 1: n }. */
export function summarizeReviews(reviews) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => { distribution[review.rating] = (distribution[review.rating] ?? 0) + 1; });
  const count = reviews.length;
  const average = count ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10 : 0;
  return { count, average, distribution };
}

export const displayName = user => `${user.name} ${user.lastName ? `${user.lastName.charAt(0)}.` : ''}`.trim();

export const reviewService = {
  byGame(gameId, reviews = db.reviews.getAll()) {
    return reviews.filter(r => r.gameId === gameId).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  hasReviewed(gameId, userId) {
    return db.reviews.getAll().some(r => r.gameId === gameId && r.userId === userId);
  },

  add({ gameId, user, rating, comment }) {
    if (!user) throw new Error('Debes iniciar sesión para publicar una reseña.');
    const errors = validateReview({ rating, comment });
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    if (this.hasReviewed(gameId, user.id)) throw new Error('Ya publicaste una reseña para este juego.');
    return db.reviews.create({
      gameId, userId: user.id, userName: displayName(user),
      rating: Number(rating), comment: sanitizeText(comment), date: new Date().toISOString()
    });
  },

  remove(id) {
    return db.reviews.remove(id);
  }
};
