// Lógica pura de filtros, orden y paginación del catálogo (fácil de testear).
import { finalPrice } from './format';

export const DEFAULT_FILTERS = { query: '', platform: 'all', category: 'all', sort: 'featured' };

export function filterGames(games, { query = '', platform = 'all', category = 'all', sort = 'featured' } = {}) {
  const q = query.trim().toLowerCase();
  const result = games.filter(game => {
    const haystack = `${game.title} ${game.category} ${game.platform} ${game.description}`.toLowerCase();
    return (!q || haystack.includes(q)) &&
      (platform === 'all' || game.platform === platform) &&
      (category === 'all' || game.category === category);
  });
  return sortGames(result, sort);
}

export function sortGames(games, sort) {
  const copy = [...games];
  const comparators = {
    rating: (a, b) => b.rating - a.rating,
    'price-asc': (a, b) => finalPrice(a) - finalPrice(b),
    'price-desc': (a, b) => finalPrice(b) - finalPrice(a),
    name: (a, b) => a.title.localeCompare(b.title, 'es'),
    featured: (a, b) => (Number(b.featured) - Number(a.featured)) || (b.rating - a.rating)
  };
  return copy.sort(comparators[sort] ?? comparators.featured);
}

export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: current, totalPages, from: items.length ? start + 1 : 0, to: Math.min(start + pageSize, items.length) };
}

export const CRITICAL_STOCK = 5;
export const isCritical = game => Number(game.stock) <= CRITICAL_STOCK;
