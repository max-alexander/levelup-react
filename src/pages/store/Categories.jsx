import { Link, useParams } from 'react-router-dom';
import CategoryCard from '../../components/store/CategoryCard';
import GameGrid from '../../components/store/GameGrid';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { sortGames } from '../../utils/catalog';

/** /categorias → listado de categorías; /categorias/:name → productos de esa categoría. */
export default function Categories() {
  const { name } = useParams();
  const games = useCollection(db.games);
  const categories = useCollection(db.categories);
  const selected = name ? categories.find(category => category.name === name) : null;
  const countOf = categoryName => games.filter(game => game.category === categoryName).length;

  return (
    <div className="container py-5">
      <PageHeader kicker="EXPLORA" title="Categorías" text="Encuentra tu próximo juego según el género que más te gusta." />
      <div className="category-grid mb-5">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} count={countOf(category.name)} active={category.name === name} />
        ))}
      </div>

      {name && !selected && (
        <EmptyState icon="fa-tag" title="Categoría no encontrada" text="La categoría solicitada no existe.">
          <Link className="btn btn-primary" to="/categorias">Ver categorías</Link>
        </EmptyState>
      )}

      {selected && (
        <section>
          <PageHeader title={selected.name} text={selected.description} />
          <GameGrid games={sortGames(games.filter(game => game.category === selected.name), 'featured')} emptyTitle="Sin juegos en esta categoría" emptyText="Pronto agregaremos nuevos títulos." />
        </section>
      )}
    </div>
  );
}
