// Lógica pura de filtros, orden y paginación del catálogo (fácil de testear).
import { finalPrice } from './format';

export const DEFAULT_FILTERS = { query: '', platform: 'all', category: 'all', price: 'all', sort: 'featured' };

/** Rangos de precio (sobre el precio final, con descuento aplicado). */
export const PRICE_RANGES = [
  { value: 'all', label: 'Cualquier precio', min: 0, max: Infinity },
  { value: 'lt20', label: 'Menos de $20.000', min: 0, max: 19999 },
  { value: '20-40', label: '$20.000 a $39.999', min: 20000, max: 39999 },
  { value: '40-60', label: '$40.000 a $59.999', min: 40000, max: 59999 },
  { value: 'gte60', label: '$60.000 o más', min: 60000, max: Infinity }
];

export function filterGames(games, { query = '', platform = 'all', category = 'all', price = 'all', sort = 'featured' } = {}) {
  const q = query.trim().toLowerCase();
  const range = PRICE_RANGES.find(r => r.value === price) ?? PRICE_RANGES[0];
  const result = games.filter(game => {
    const haystack = `${game.title} ${game.category} ${game.platform} ${game.description}`.toLowerCase();
    const amount = finalPrice(game);
    return (!q || haystack.includes(q)) &&
      (platform === 'all' || game.platform === platform) &&
      (category === 'all' || game.category === category) &&
      amount >= range.min && amount <= range.max;
  });
  return sortGames(result, sort);
}

/**
 * Sugerencias para el buscador: primero los títulos que empiezan con el texto,
 * luego los que lo contienen y al final coincidencias por plataforma o categoría.
 */
export function suggestGames(games, query, limit = 5) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const score = game => {
    const title = game.title.toLowerCase();
    if (title.startsWith(q)) return 0;
    if (title.split(/[\s:]+/).some(word => word.startsWith(q))) return 1;
    if (title.includes(q)) return 2;
    if (`${game.platform} ${game.category}`.toLowerCase().includes(q)) return 3;
    return -1;
  };
  return games
    .map(game => ({ game, rank: score(game) }))
    .filter(item => item.rank >= 0)
    .sort((a, b) => a.rank - b.rank || b.game.rating - a.game.rating)
    .slice(0, limit)
    .map(item => item.game);
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
