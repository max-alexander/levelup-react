import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GameGrid from '../../components/store/GameGrid';
import CatalogFilters from '../../components/store/CatalogFilters';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { DEFAULT_FILTERS, filterGames, paginate } from '../../utils/catalog';

export const PAGE_SIZE = 9;

export default function Catalog() {
  const games = useCollection(db.games);
  const categories = useCollection(db.categories).map(category => category.name);
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, query: params.get('q') ?? '' });
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState('grid');

  // Si se busca desde el navbar estando en esta misma vista, se sincroniza el filtro.
  useEffect(() => {
    setFilters(current => ({ ...current, query: params.get('q') ?? '' }));
    setPage(1);
  }, [params]);

  const filtered = useMemo(() => filterGames(games, filters), [games, filters]);
  const pageData = paginate(filtered, page, PAGE_SIZE);

  const changeFilters = next => {
    setFilters(next);
    setPage(1);
    if (next.query !== filters.query) setParams(next.query ? { q: next.query } : {}, { replace: true });
  };

  return (
    <div className="container py-5">
      <PageHeader kicker="TIENDA" title="Productos" text={filtered.length ? `${pageData.from}–${pageData.to} de ${filtered.length} juegos` : '0 juegos encontrados'}>
        <div className="view-toggle" role="group" aria-label="Vista">
          <button type="button" className={layout === 'grid' ? 'active' : ''} aria-label="Vista en cuadrícula" onClick={() => setLayout('grid')}><i className="fa-solid fa-grip" /></button>
          <button type="button" className={layout === 'list' ? 'active' : ''} aria-label="Vista en lista" onClick={() => setLayout('list')}><i className="fa-solid fa-list" /></button>
        </div>
      </PageHeader>
      <CatalogFilters filters={filters} categories={categories} onChange={changeFilters} onReset={() => changeFilters(DEFAULT_FILTERS)} />
      <GameGrid games={pageData.items} layout={layout} />
      <Pagination page={pageData.page} totalPages={pageData.totalPages} onChange={setPage} />
    </div>
  );
}
