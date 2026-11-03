import { render, screen, fireEvent } from '@testing-library/react';
import { renderApp, currentPath } from '../../test/helpers';
import { suggestGames, filterGames } from '../../utils/catalog';
import { finalPrice } from '../../utils/format';
import { SEED_GAMES } from '../../data/seed';
import { ThemeProvider, THEME_KEY } from '../../context/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';

describe('suggestGames y filtro de precio (lógica)', () => {
  it('prioriza títulos que empiezan con el texto y limita la cantidad', () => {
    expect(suggestGames(SEED_GAMES, 'h')).toEqual([]); // menos de 2 caracteres
    const result = suggestGames(SEED_GAMES, 'ha');
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.slice(0, 3).every(game => game.title.toLowerCase().startsWith('ha'))).toBeTrue();
    expect(suggestGames(SEED_GAMES, 'kart').map(game => game.title)).toContain('Mario Kart 8 Deluxe');
    expect(suggestGames(SEED_GAMES, 'xbox', 50).every(game => game.platform === 'Xbox')).toBeTrue();
  });

  it('filtra por rango de precio usando el precio con descuento', () => {
    const cheap = filterGames(SEED_GAMES, { price: 'lt20' });
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every(game => finalPrice(game) < 20000)).toBeTrue();
    const mid = filterGames(SEED_GAMES, { price: '40-60' });
    expect(mid.every(game => finalPrice(game) >= 40000 && finalPrice(game) <= 59999)).toBeTrue();
    expect(filterGames(SEED_GAMES, { price: 'desconocido' }).length).toBe(SEED_GAMES.length);
  });
});

describe('SearchBox (sugerencias en vivo)', () => {
  const openSearch = () => {
    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir búsqueda' })[0]);
    return screen.getByRole('combobox', { name: 'Buscar en la tienda' });
  };

  it('muestra sugerencias con portada al escribir y las oculta si se borra', () => {
    renderApp('/');
    const input = openSearch();
    fireEvent.change(input, { target: { value: 'zel' } });
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    expect(screen.getByRole('option', { name: /Zelda/ })).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('con flechas y Enter abre el detalle de la sugerencia elegida', () => {
    renderApp('/');
    const input = openSearch();
    fireEvent.change(input, { target: { value: 'hollow' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('option')[0].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(currentPath(screen)).toBe('/productos/15');
    expect(screen.queryByRole('combobox')).toBeNull(); // el panel se cierra al navegar
  });

  it('"Ver todos los resultados" lleva al catálogo filtrado', () => {
    renderApp('/');
    const input = openSearch();
    fireEvent.change(input, { target: { value: 'mario' } });
    fireEvent.mouseDown(screen.getByRole('button', { name: /Ver todos los resultados/ }));
    expect(currentPath(screen)).toBe('/productos?q=mario');
  });

  it('el catálogo filtra por precio desde el selector', () => {
    renderApp('/productos');
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: 'gte60' } });
    const expected = SEED_GAMES.filter(game => finalPrice(game) >= 60000).length;
    expect(screen.getAllByTestId('game-card').length).toBe(expected);
  });
});

describe('Tema claro/oscuro (Context + localStorage)', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('aplica el tema guardado y alterna al hacer clic', () => {
    localStorage.setItem(THEME_KEY, JSON.stringify('light'));
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(JSON.parse(localStorage.getItem(THEME_KEY))).toBe('dark');
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toBeTruthy();
  });

  it('usa el tema oscuro por defecto', () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });
});
