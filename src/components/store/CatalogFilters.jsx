import { PLATFORMS } from '../../data/seed';
import { PRICE_RANGES } from '../../utils/catalog';

/** Filtros controlados: el estado vive en el componente padre y llega por props. */
export default function CatalogFilters({ filters, categories, onChange, onReset }) {
  const update = field => event => onChange({ ...filters, [field]: event.target.value });
  return (
    <div className="filter-panel mb-4" role="search">
      <div className="search-field">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input type="search" aria-label="Buscar juegos" placeholder="Buscar por título, categoría o plataforma..." value={filters.query} onChange={update('query')} />
      </div>
      <select className="form-select" aria-label="Plataforma" value={filters.platform} onChange={update('platform')}>
        <option value="all">Todas las plataformas</option>
        {PLATFORMS.map(platform => <option key={platform} value={platform}>{platform}</option>)}
      </select>
      <select className="form-select" aria-label="Categoría" value={filters.category} onChange={update('category')}>
        <option value="all">Todas las categorías</option>
        {categories.map(category => <option key={category} value={category}>{category}</option>)}
      </select>
      <select className="form-select" aria-label="Precio" value={filters.price ?? 'all'} onChange={update('price')}>
        {PRICE_RANGES.map(range => <option key={range.value} value={range.value}>{range.label}</option>)}
      </select>
      <select className="form-select" aria-label="Ordenar" value={filters.sort} onChange={update('sort')}>
        <option value="featured">Destacados</option>
        <option value="rating">Mejor valorados</option>
        <option value="price-asc">Precio: menor a mayor</option>
        <option value="price-desc">Precio: mayor a menor</option>
        <option value="name">Nombre A-Z</option>
      </select>
      <button type="button" className="btn btn-reset" onClick={onReset}>
        <i className="fa-solid fa-rotate-left me-2" /><span>Limpiar</span>
      </button>
    </div>
  );
}
