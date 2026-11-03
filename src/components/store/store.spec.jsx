import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameCard from './GameCard';
import { GameList } from './GameGrid';
import CatalogFilters from './CatalogFilters';
import { DEFAULT_FILTERS } from '../../utils/catalog';
import { SEED_GAMES } from '../../data/seed';

const withRouter = ui => render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>);
const zelda = SEED_GAMES.find(game => game.id === 11);
const spiderman = SEED_GAMES.find(game => game.id === 2);
const gears = SEED_GAMES.find(game => game.id === 9);

describe('GameCard (props y eventos)', () => {
  it('renderiza los datos del juego recibido por props', () => {
    withRouter(<GameCard game={zelda} onAddToCart={() => {}} />);
    expect(screen.getByRole('heading', { name: zelda.title })).toBeTruthy();
    expect(screen.getByText('Nintendo Switch')).toBeTruthy();
    expect(screen.getByText('Aventura')).toBeTruthy();
    expect(screen.getByText('10 disponibles')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Detalles' }).getAttribute('href')).toBe('/productos/11');
  });

  it('muestra precio tachado y badge cuando el juego está en oferta', () => {
    withRouter(<GameCard game={spiderman} onAddToCart={() => {}} />);
    expect(screen.getByText('OFERTA')).toBeTruthy();
    expect(screen.getByText('-15%')).toBeTruthy();
    expect(document.querySelector('del')).not.toBeNull();
  });

  it('al hacer clic en "Agregar al carrito" ejecuta onAddToCart con el juego', () => {
    const onAdd = jasmine.createSpy('onAddToCart');
    withRouter(<GameCard game={zelda} onAddToCart={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /Agregar al carrito/ }));
    expect(onAdd).toHaveBeenCalledOnceWith(zelda);
  });

  it('deshabilita la compra cuando no hay stock', () => {
    const onAdd = jasmine.createSpy('onAddToCart');
    withRouter(<GameCard game={gears} onAddToCart={onAdd} />);
    const button = screen.getByRole('button', { name: /Sin stock/ });
    expect(button.disabled).toBeTrue();
    expect(screen.getByText('Agotado')).toBeTruthy();
  });

  it('el botón de favorito refleja el estado y emite el id', () => {
    const onFav = jasmine.createSpy('onToggleFavorite');
    withRouter(<GameCard game={zelda} onAddToCart={() => {}} onToggleFavorite={onFav} isFavorite />);
    const fav = screen.getByRole('button', { name: 'Quitar de favoritos' });
    expect(fav.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(fav);
    expect(onFav).toHaveBeenCalledWith(11);
  });
});

describe('GameList (renderizado de listas)', () => {
  it('renderiza una tarjeta por cada elemento del conjunto de datos', () => {
    withRouter(<GameList games={SEED_GAMES} onAddToCart={() => {}} />);
    expect(screen.getAllByTestId('game-card').length).toBe(SEED_GAMES.length);
    SEED_GAMES.forEach(game => expect(screen.getByRole('heading', { name: game.title })).toBeTruthy());
  });

  it('muestra un estado vacío cuando no hay juegos', () => {
    withRouter(<GameList games={[]} onAddToCart={() => {}} emptyTitle="Nada por aquí" />);
    expect(screen.queryAllByTestId('game-card').length).toBe(0);
    expect(screen.getByText('Nada por aquí')).toBeTruthy();
  });

  it('cambia a vista de lista según la prop layout', () => {
    withRouter(<GameList games={SEED_GAMES.slice(0, 2)} layout="list" onAddToCart={() => {}} />);
    screen.getAllByTestId('game-card').forEach(card => expect(card.className).toContain('list-mode'));
  });
});

describe('CatalogFilters (componente controlado)', () => {
  it('emite los filtros actualizados al escribir y seleccionar', () => {
    const onChange = jasmine.createSpy('onChange');
    render(<CatalogFilters filters={DEFAULT_FILTERS} categories={['Acción', 'RPG']} onChange={onChange} onReset={() => {}} />);
    fireEvent.change(screen.getByLabelText('Buscar juegos'), { target: { value: 'zelda' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, query: 'zelda' });
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'RPG' } });
    expect(onChange.calls.mostRecent().args[0].category).toBe('RPG');
    expect(within(screen.getByLabelText('Categoría')).getAllByRole('option').length).toBe(3);
  });

  it('el botón Limpiar llama a onReset', () => {
    const onReset = jasmine.createSpy('onReset');
    render(<CatalogFilters filters={DEFAULT_FILTERS} categories={[]} onChange={() => {}} onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: /Limpiar/ }));
    expect(onReset).toHaveBeenCalled();
  });
});
