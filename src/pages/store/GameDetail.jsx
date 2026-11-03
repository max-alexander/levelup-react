import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import GameImage from '../../components/common/GameImage';
import Stars from '../../components/common/Stars';
import PriceTag from '../../components/common/PriceTag';
import EmptyState from '../../components/common/EmptyState';
import GameGrid from '../../components/store/GameGrid';
import ProductReviews from '../../components/store/Reviews';
import { reviewService, summarizeReviews } from '../../services/reviewService';
import { useCollection } from '../../hooks/useCollection';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { stockStatus } from '../../utils/format';

export default function GameDetail() {
  const { id } = useParams();
  const games = useCollection(db.games);
  const reviews = useCollection(db.reviews);
  const game = games.find(item => String(item.id) === id);
  const cart = useCart();
  const favorites = useFavorites();
  const { notify } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (!game) {
    return (
      <div className="container py-5">
        <EmptyState icon="fa-ghost" title="Producto no encontrado" text="Puede que haya sido eliminado del catálogo.">
          <Link className="btn btn-primary" to="/productos">Volver al catálogo</Link>
        </EmptyState>
      </div>
    );
  }

  const inCart = cart.lines.find(line => line.id === game.id)?.quantity ?? 0;
  const available = Math.max(0, game.stock - inCart);
  const stock = stockStatus(game.stock);
  const reviewCount = summarizeReviews(reviewService.byGame(game.id, reviews)).count;
  const related = games.filter(item => item.category === game.category && item.id !== game.id).slice(0, 3);

  const add = () => {
    if (quantity > available) {
      notify('Stock insuficiente', `Puedes agregar ${available} unidad(es) más.`, 'warning');
      return;
    }
    cart.addItem(game, quantity);
    notify('Agregado al carrito', `${quantity} × ${game.title}`, 'success');
    setQuantity(1);
  };

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/productos">Productos</Link></li>
          <li className="breadcrumb-item"><Link to={`/categorias/${encodeURIComponent(game.category)}`}>{game.category}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{game.title}</li>
        </ol>
      </nav>
      <div className="surface-card p-0 overflow-hidden mb-5">
        <div className="row g-0">
          <div className="col-lg-6"><GameImage game={game} className="game-detail-image" fit="contain" /></div>
          <div className="col-lg-6">
            <div className="detail-content">
              <span className="section-kicker">{game.category} · {game.platform}</span>
              <h1 className="detail-title mt-2">{game.title}</h1>
              <div className="my-3 d-flex align-items-center gap-3 flex-wrap"><Stars rating={game.rating} /><a href="#reviews-title" className="small">{reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}</a></div>
              <p className="text-secondary">{game.description}</p>
              <div className="d-flex justify-content-between align-items-end my-4">
                <PriceTag game={game} />
                <span className={`stock ${stock.level}`}>{stock.label}</span>
              </div>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <label htmlFor="qty" className="visually-hidden">Cantidad</label>
                <input id="qty" type="number" className="form-control qty-input" min={1} max={Math.max(1, available)} value={quantity} disabled={!available}
                  onChange={event => setQuantity(Math.max(1, Math.min(available || 1, Number(event.target.value) || 1)))} />
                <button type="button" className="btn btn-primary flex-grow-1" disabled={!available} onClick={add}>
                  <i className="fa-solid fa-cart-plus me-2" />{available ? 'Agregar al carrito' : 'Sin stock disponible'}
                </button>
                <button type="button" className="btn btn-soft" aria-label="Favorito" onClick={() => favorites.toggle(game.id)}>
                  <i className={`fa-${favorites.isFavorite(game.id) ? 'solid text-danger' : 'regular'} fa-heart`} />
                </button>
              </div>
              {inCart > 0 && <small className="text-secondary d-block mt-2">Tienes {inCart} en el carrito.</small>}
            </div>
          </div>
        </div>
      </div>
      <ProductReviews gameId={game.id} />
      {related.length > 0 && (
        <section>
          <h3 className="mb-3">También te puede gustar</h3>
          <GameGrid games={related} />
        </section>
      )}
    </div>
  );
}
