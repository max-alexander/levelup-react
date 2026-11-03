import { render, screen, fireEvent, within } from '@testing-library/react';
import StarRatingInput from './StarRatingInput';
import { ReviewForm, ReviewList, ReviewSummary } from './Reviews';
import { reviewService, summarizeReviews, validateReview, displayName } from '../../services/reviewService';
import { renderApp, renderAdmin } from '../../test/helpers';
import { db } from '../../data/db';
import { SEED_REVIEWS } from '../../data/seed';

const user = { id: 2, name: 'Usuario', lastName: 'Cliente' };

describe('reviewService (lógica de reseñas)', () => {
  it('calcula promedio con un decimal y distribución por estrellas', () => {
    const summary = summarizeReviews([{ rating: 5 }, { rating: 4 }, { rating: 4 }]);
    expect(summary).toEqual({ count: 3, average: 4.3, distribution: { 5: 1, 4: 2, 3: 0, 2: 0, 1: 0 } });
    expect(summarizeReviews([])).toEqual(jasmine.objectContaining({ count: 0, average: 0 }));
  });

  it('valida estrellas (1 a 5) y largo del comentario', () => {
    expect(validateReview({ rating: 0, comment: 'corto' })).toEqual({ rating: jasmine.any(String), comment: jasmine.any(String) });
    expect(validateReview({ rating: 4, comment: 'Un comentario válido y suficientemente largo.' })).toEqual({});
  });

  it('agrega una reseña, muestra el nombre abreviado e impide reseñar dos veces el mismo juego', () => {
    const review = reviewService.add({ gameId: 2, user, rating: 4, comment: '  Muy buen juego,   lo recomiendo.  ' });
    expect(review).toEqual(jasmine.objectContaining({ gameId: 2, userId: 2, userName: 'Usuario C.', rating: 4, comment: 'Muy buen juego, lo recomiendo.' }));
    expect(() => reviewService.add({ gameId: 2, user, rating: 5, comment: 'Otro comentario largo.' })).toThrowError('Ya publicaste una reseña para este juego.');
    expect(() => reviewService.add({ gameId: 3, user: null, rating: 5, comment: 'Sin sesión no se puede.' })).toThrowError(/iniciar sesión/);
    expect(displayName({ name: 'Ana' })).toBe('Ana');
  });

  it('byGame filtra y ordena de la más reciente a la más antigua', () => {
    const list = reviewService.byGame(11);
    expect(list.length).toBe(SEED_REVIEWS.filter(r => r.gameId === 11).length);
    expect(new Date(list[0].date) >= new Date(list[1].date)).toBeTrue();
  });
});

describe('StarRatingInput (props, estado y eventos de teclado)', () => {
  it('emite la estrella elegida con clic', () => {
    const onChange = jasmine.createSpy('onChange');
    render(<StarRatingInput value={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '4 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('marca la estrella actual y se maneja con las flechas', () => {
    const onChange = jasmine.createSpy('onChange');
    render(<StarRatingInput value={3} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: '3 estrellas' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('Bueno')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' });
    expect(onChange.calls.allArgs()).toEqual([[4], [2]]);
  });

  it('el hover previsualiza la calificación', () => {
    render(<StarRatingInput value={1} onChange={() => {}} />);
    fireEvent.mouseEnter(screen.getByRole('radio', { name: '5 estrellas' }));
    expect(screen.getByText('Excelente')).toBeTruthy();
    fireEvent.mouseLeave(screen.getByRole('radiogroup'));
    expect(screen.getByText('Malo')).toBeTruthy();
  });
});

describe('Componentes de reseñas', () => {
  it('ReviewList renderiza una reseña por elemento o un mensaje si no hay', () => {
    const { rerender } = render(<ReviewList reviews={SEED_REVIEWS} />);
    expect(screen.getAllByTestId('review-item').length).toBe(SEED_REVIEWS.length);
    rerender(<ReviewList reviews={[]} />);
    expect(screen.getByText(/aún no tiene reseñas/)).toBeTruthy();
  });

  it('ReviewSummary muestra promedio y cantidad', () => {
    render(<ReviewSummary summary={summarizeReviews([{ rating: 5 }, { rating: 3 }])} />);
    expect(screen.getByTestId('review-average').textContent).toBe('4.0');
    expect(screen.getByText('2 reseñas')).toBeTruthy();
  });

  it('ReviewForm valida antes de enviar y entrega los datos por onSubmit', () => {
    const onSubmit = jasmine.createSpy('onSubmit').and.returnValue(true);
    render(<ReviewForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Elige entre 1 y 5 estrellas.')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: '5 estrellas' }));
    fireEvent.change(screen.getByLabelText('Comentario'), { target: { value: 'Me encantó de principio a fin.' } });
    expect(screen.getByText('30/300')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));
    expect(onSubmit).toHaveBeenCalledWith({ rating: 5, comment: 'Me encantó de principio a fin.' });
    expect(screen.getByLabelText('Comentario').value).toBe('');
  });
});

describe('Reseñas integradas en la tienda y el admin', () => {
  it('sin sesión invita a iniciar sesión en lugar de mostrar el formulario', () => {
    renderApp('/productos/11');
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Publicar reseña' })).toBeNull();
  });

  it('un cliente publica una reseña y el promedio se actualiza en vivo', () => {
    renderApp('/productos/24', { as: 'user' });
    const section = screen.getByRole('region', { name: 'Opiniones de clientes' });
    expect(within(section).getByTestId('review-average').textContent).toBe('5.0');
    fireEvent.click(within(section).getByRole('radio', { name: '3 estrellas' }));
    fireEvent.change(within(section).getByLabelText('Comentario'), { target: { value: 'Bonito, pero algo corto para su precio.' } });
    fireEvent.click(within(section).getByRole('button', { name: 'Publicar reseña' }));
    expect(within(section).getAllByTestId('review-item').length).toBe(2);
    expect(within(section).getByTestId('review-average').textContent).toBe('4.0');
    expect(within(section).getByText('Ya publicaste tu reseña de este juego.')).toBeTruthy();
  });

  it('el administrador modera (elimina) una reseña', async () => {
    const total = db.reviews.getAll().length;
    await renderAdmin('/admin/resenas');
    expect(document.querySelectorAll('tbody tr').length).toBe(total);
    fireEvent.change(screen.getByLabelText('Filtrar por calificación'), { target: { value: '4' } });
    expect(document.querySelectorAll('tbody tr').length).toBe(SEED_REVIEWS.filter(r => r.rating === 4).length);
    fireEvent.click(screen.getAllByLabelText(/Eliminar reseña de/)[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(db.reviews.getAll().length).toBe(total - 1);
  });
});
