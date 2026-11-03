import { rawgService, RAWG_API_URL } from './rawgService';
import { db } from '../data/db';

/** Crea un mock de Response de fetch. */
const response = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(body) });

describe('rawgService (API externa mockeada)', () => {
  it('searchCover consulta RAWG y devuelve la primera portada', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(response({ results: [{ background_image: 'https://img/1.jpg' }] }));
    const cover = await rawgService.searchCover('Celeste');
    expect(cover).toBe('https://img/1.jpg');
    const url = fetchSpy.calls.mostRecent().args[0];
    expect(url.startsWith(RAWG_API_URL)).toBeTrue();
    expect(url).toContain('search=Celeste');
  });

  it('searchCover lanza error si la API responde con error HTTP', async () => {
    const fetchFn = jasmine.createSpy('fetch').and.returnValue(response({}, false, 500));
    await expectAsync(rawgService.searchCover('X', fetchFn)).toBeRejectedWithError('HTTP 500');
  });

  it('syncCovers actualiza solo los juegos sin imagen y cuenta los fallos', async () => {
    db.games.update(1, { image: 'https://ya-tiene.jpg' });
    const pending = db.games.getAll().filter(game => !game.image).length;
    let call = 0;
    const fetchFn = jasmine.createSpy('fetch').and.callFake(() => {
      call++;
      if (call === 1) return Promise.reject(new Error('offline'));
      if (call === 2) return response({ results: [] });
      return response({ results: [{ background_image: `https://img/${call}.jpg` }] });
    });

    const result = await rawgService.syncCovers({ fetchFn });

    expect(fetchFn).toHaveBeenCalledTimes(pending);
    expect(result).toEqual({ updated: pending - 2, failed: 2, total: pending });
    expect(db.games.getById(1).image).toBe('https://ya-tiene.jpg');
    expect(db.games.getAll().filter(game => game.source === 'rawg').length).toBe(pending - 2);
  });
});
