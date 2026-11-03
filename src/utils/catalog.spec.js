import { filterGames, sortGames, paginate, isCritical } from './catalog';
import { finalPrice, formatMoney, stockStatus, sanitizeText } from './format';
import { SEED_GAMES } from '../data/seed';

describe('Lógica del catálogo y formato', () => {
  it('filtra por texto, plataforma y categoría', () => {
    expect(filterGames(SEED_GAMES, { query: 'mario' }).map(g => g.id).sort()).toEqual([12, 13]);
    expect(filterGames(SEED_GAMES, { platform: 'Xbox' }).every(g => g.platform === 'Xbox')).toBeTrue();
    expect(filterGames(SEED_GAMES, { platform: 'Nintendo Switch', category: 'Plataformas' }).map(g => g.id).sort((a, b) => a - b)).toEqual([12, 16, 44, 47]);
    expect(filterGames(SEED_GAMES, { query: 'no-existe' })).toEqual([]);
  });

  it('ordena por precio final (con descuento) sin mutar el arreglo original', () => {
    const original = [...SEED_GAMES];
    const sorted = sortGames(SEED_GAMES, 'price-asc');
    expect(SEED_GAMES).toEqual(original);
    for (let i = 1; i < sorted.length; i++) expect(finalPrice(sorted[i - 1])).toBeLessThanOrEqual(finalPrice(sorted[i]));
    expect(sortGames(SEED_GAMES, 'name')[0].title).toBe('Animal Crossing: New Horizons');
  });

  it('pagina resultados y ajusta páginas fuera de rango', () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    expect(paginate(items, 1, 9)).toEqual(jasmine.objectContaining({ page: 1, totalPages: 3, from: 1, to: 9 }));
    expect(paginate(items, 99, 9).items).toEqual([18, 19]);
    expect(paginate([], 1, 9)).toEqual(jasmine.objectContaining({ totalPages: 1, from: 0 }));
  });

  it('calcula precio final, estado de stock y formato CLP', () => {
    expect(finalPrice({ price: 10000, discount: 25 })).toBe(7500);
    expect(finalPrice({ price: 10000 })).toBe(10000);
    expect(stockStatus(0).level).toBe('out');
    expect(stockStatus(3).level).toBe('low');
    expect(stockStatus(20).label).toBe('20 disponibles');
    expect(isCritical({ stock: 5 })).toBeTrue();
    expect(formatMoney(59990).replace(/\s/g, '')).toBe('$59.990');
    expect(sanitizeText('  hola    mundo ')).toBe('hola mundo');
  });
});
