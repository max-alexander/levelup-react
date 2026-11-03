import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameImage from '../common/GameImage';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { suggestGames } from '../../utils/catalog';
import { finalPrice, formatMoney } from '../../utils/format';

/**
 * Buscador con sugerencias (patrón combobox de ARIA).
 * Flechas: moverse · Enter: abrir sugerencia o ver todos los resultados · Esc: limpiar/cerrar.
 */
export default function SearchBox({ onNavigate = () => {}, autoFocus = false }) {
  const games = useCollection(db.games);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const suggestions = suggestGames(games, query);
  const open = suggestions.length > 0;

  const go = path => {
    navigate(path);
    setQuery('');
    setActive(-1);
    onNavigate();
  };
  const goToResults = () => go(`/productos?q=${encodeURIComponent(query.trim())}`);

  const handleKeyDown = event => {
    if (event.key === 'ArrowDown' && open) {
      event.preventDefault();
      setActive(index => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && open) {
      event.preventDefault();
      setActive(index => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (active >= 0 && suggestions[active]) go(`/productos/${suggestions[active].id}`);
      else if (query.trim()) goToResults();
    } else if (event.key === 'Escape') {
      if (query) setQuery('');
      else onNavigate();
      setActive(-1);
    }
  };

  return (
    <div className="search-box" role="search">
      <div className="search-field">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          type="search"
          role="combobox"
          aria-label="Buscar en la tienda"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `suggestion-${suggestions[active]?.id}` : undefined}
          placeholder="Busca por título, plataforma o género…"
          autoFocus={autoFocus}
          value={query}
          onChange={event => { setQuery(event.target.value); setActive(-1); }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {open && (
        <div className="search-dropdown">
          <ul id="search-suggestions" role="listbox" aria-label="Sugerencias">
            {suggestions.map((game, index) => (
              <li
                key={game.id}
                id={`suggestion-${game.id}`}
                role="option"
                aria-selected={index === active}
                className={index === active ? 'active' : ''}
                onMouseEnter={() => setActive(index)}
                onMouseDown={event => { event.preventDefault(); go(`/productos/${game.id}`); }}
              >
                <GameImage game={game} className="thumb" />
                <span className="flex-grow-1">
                  <strong className="d-block">{game.title}</strong>
                  <small className="text-secondary">{game.platform} · {game.category}</small>
                </span>
                <strong className="text-nowrap">{formatMoney(finalPrice(game))}</strong>
              </li>
            ))}
          </ul>
          <button type="button" className="search-all" onMouseDown={event => { event.preventDefault(); goToResults(); }}>
            Ver todos los resultados para “{query.trim()}” <i className="fa-solid fa-arrow-right ms-1" />
          </button>
        </div>
      )}
    </div>
  );
}
