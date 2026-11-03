// Integración con la API pública de RAWG (heredada de la entrega 1).
// Completa la portada (imagen) de los juegos del catálogo y permite importar nuevos títulos.
import { db } from '../data/db';

export const RAWG_API_URL = 'https://api.rawg.io/api/games';
export const RAWG_API_KEY = '4ebcdb66f44a4f1586bd20cdd53d732f';

export const rawgService = {
  async searchCover(title, fetchFn = window.fetch.bind(window)) {
    const params = new URLSearchParams({ key: RAWG_API_KEY, search: title, page_size: '1', search_precise: 'true' });
    const response = await fetchFn(`${RAWG_API_URL}?${params}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const first = Array.isArray(data?.results) ? data.results[0] : null;
    return first?.background_image ?? null;
  },

  /** Busca portadas para los juegos sin imagen. Devuelve cuántos se actualizaron y cuántos fallaron. */
  async syncCovers({ fetchFn } = {}) {
    const pending = db.games.getAll().filter(game => !game.image);
    const results = await Promise.allSettled(pending.map(game => this.searchCover(game.title, fetchFn)));
    let updated = 0;
    let failed = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        db.games.update(pending[index].id, { image: result.value, source: 'rawg' });
        updated++;
      } else {
        failed++;
      }
    });
    return { updated, failed, total: pending.length };
  }
};
