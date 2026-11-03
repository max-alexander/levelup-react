import GameGrid from '../../components/store/GameGrid';
import PageHeader from '../../components/common/PageHeader';
import { useCollection } from '../../hooks/useCollection';
import { useFavorites } from '../../context/FavoritesContext';
import { db } from '../../data/db';

export default function Favorites() {
  const games = useCollection(db.games);
  const { ids } = useFavorites();
  return (
    <div className="container py-5">
      <PageHeader kicker="TU SELECCIÓN" title="Favoritos" text="Guarda los juegos que quieres revisar después." />
      <GameGrid games={games.filter(game => ids.includes(game.id))} emptyTitle="Aún no tienes favoritos" emptyText="Marca el corazón de cualquier juego para guardarlo aquí." />
    </div>
  );
}
