import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import Stars from '../../components/common/Stars';
import { useCollection } from '../../hooks/useCollection';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { reviewService, summarizeReviews } from '../../services/reviewService';
import { formatDate } from '../../utils/format';

/** Moderación de reseñas: filtrar por calificación y eliminar las inapropiadas. */
export default function ReviewModeration() {
  const reviews = useCollection(db.reviews);
  const games = useCollection(db.games);
  const { notify } = useToast();
  const [rating, setRating] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const summary = summarizeReviews(reviews);
  const visible = reviews
    .filter(review => rating === 'all' || review.rating === Number(rating))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const titleOf = gameId => games.find(game => game.id === gameId)?.title ?? 'Producto eliminado';

  const confirmDelete = () => {
    reviewService.remove(toDelete.id);
    notify('Reseña eliminada', `De ${toDelete.userName}`, 'info');
    setToDelete(null);
  };

  return (
    <>
      <PageHeader kicker="COMUNIDAD" title="Reseñas" text={`${summary.count} reseñas · promedio ${summary.count ? summary.average.toFixed(1) : '—'} de 5`}>
        <select className="form-select" aria-label="Filtrar por calificación" value={rating} onChange={event => setRating(event.target.value)}>
          <option value="all">Todas las calificaciones</option>
          {[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} {star === 1 ? 'estrella' : 'estrellas'}</option>)}
        </select>
      </PageHeader>
      <div className="surface-card">
        <div className="table-responsive">
          <table className="table app-table align-middle">
            <thead><tr><th>Juego</th><th>Cliente</th><th>Calificación</th><th>Comentario</th><th>Fecha</th><th className="text-end">Acciones</th></tr></thead>
            <tbody>
              {visible.length ? visible.map(review => (
                <tr key={review.id}>
                  <td><Link to={`/productos/${review.gameId}`}>{titleOf(review.gameId)}</Link></td>
                  <td>{review.userName}</td>
                  <td className="text-nowrap"><Stars rating={review.rating} /></td>
                  <td className="review-cell">{review.comment}</td>
                  <td className="text-nowrap">{formatDate(review.date)}</td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Eliminar reseña de ${review.userName} en ${titleOf(review.gameId)}`} onClick={() => setToDelete(review)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan={6} className="text-center text-secondary py-4">No hay reseñas con ese filtro.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal show={Boolean(toDelete)} title="Eliminar reseña" message={`¿Eliminar la reseña de ${toDelete?.userName}?`} confirmLabel="Eliminar" onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
    </>
  );
}
