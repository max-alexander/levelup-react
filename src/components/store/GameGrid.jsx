import GameCard from './GameCard';
import EmptyState from '../common/EmptyState';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';

/** Lista presentacional: renderiza una tarjeta por cada juego recibido. */
export function GameList({ games, onAddToCart, onToggleFavorite, isFavorite = () => false, layout = 'grid', emptyTitle = 'No encontramos juegos', emptyText = 'Prueba con otros filtros o términos de búsqueda.' }) {
  if (!games.length) return <EmptyState icon="fa-magnifying-glass" title={emptyTitle} text={emptyText} />;
  return (
    <div className={layout === 'grid' ? 'row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4' : 'row row-cols-1 g-3'}>
      {games.map(game => (
        <div className="col" key={game.id}>
          <GameCard game={game} layout={layout} onAddToCart={onAddToCart} onToggleFavorite={onToggleFavorite} isFavorite={isFavorite(game.id)} />
        </div>
      ))}
    </div>
  );
}

/** Contenedor: conecta GameList con el carrito, los favoritos y las notificaciones. */
export default function GameGrid(props) {
  const cart = useCart();
  const favorites = useFavorites();
  const { notify } = useToast();

  const handleAdd = game => {
    const inCart = cart.lines.find(line => line.id === game.id)?.quantity ?? 0;
    if (inCart >= game.stock) {
      notify('Stock máximo', `Solo quedan ${game.stock} unidades de ${game.title}.`, 'warning');
      return;
    }
    cart.addItem(game);
    notify('Agregado al carrito', game.title, 'success');
  };

  return <GameList {...props} onAddToCart={handleAdd} onToggleFavorite={favorites.toggle} isFavorite={favorites.isFavorite} />;
}
