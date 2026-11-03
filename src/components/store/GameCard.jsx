import { Link } from 'react-router-dom';
import GameImage from '../common/GameImage';
import Stars from '../common/Stars';
import PriceTag from '../common/PriceTag';
import { stockStatus } from '../../utils/format';

/**
 * Tarjeta de producto. Es presentacional: recibe el juego y los callbacks por props
 * (onAddToCart, onToggleFavorite) y no conoce el contexto global.
 */
export default function GameCard({ game, onAddToCart, onToggleFavorite, isFavorite = false, layout = 'grid' }) {
  const stock = stockStatus(game.stock);
  return (
    <article className={`game-card ${layout === 'list' ? 'list-mode' : ''}`} data-testid="game-card">
      <div className="game-image-wrap">
        <Link to={`/productos/${game.id}`} aria-label={`Ver ${game.title}`}><GameImage game={game} /></Link>
        {onToggleFavorite && (
          <button
            type="button"
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={isFavorite}
            onClick={() => onToggleFavorite(game.id)}
          >
            <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`} />
          </button>
        )}
        <span className="platform-badge">{game.platform}</span>
        {game.discount > 0 && <span className="offer-badge">OFERTA</span>}
      </div>
      <div className="game-card-body">
        <span className="genre">{game.category}</span>
        <h3 className="game-title">{game.title}</h3>
        <Stars rating={game.rating} />
        <p className="game-desc">{game.description}</p>
        <div className="card-bottom">
          <div className="d-flex justify-content-between align-items-end mb-3 gap-2">
            <div>
              <span className={`stock ${stock.level}`}>{stock.label}</span>
              <PriceTag game={game} />
            </div>
            <Link className="btn btn-sm btn-soft" to={`/productos/${game.id}`}>Detalles</Link>
          </div>
          <button type="button" className="btn btn-primary w-100" disabled={game.stock <= 0} onClick={() => onAddToCart(game)}>
            <i className="fa-solid fa-cart-plus me-2" />{game.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </article>
  );
}
