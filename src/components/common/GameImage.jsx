import { useState } from 'react';

const PLATFORM_ICON = {
  PlayStation: 'fa-brands fa-playstation',
  Xbox: 'fa-brands fa-xbox',
  'Nintendo Switch': 'fa-solid fa-gamepad'
};

/** Imagen del juego con placeholder si no hay URL o si la imagen falla al cargar. */
export default function GameImage({ game, className = 'game-image' }) {
  const [broken, setBroken] = useState(false);

  if (!game.image || broken) {
    const platformClass = `ph-${String(game.platform || '').split(' ')[0].toLowerCase()}`;
    return (
      <div className={`${className} game-placeholder ${platformClass}`} role="img" aria-label={game.title}>
        <i className={PLATFORM_ICON[game.platform] ?? 'fa-solid fa-gamepad'} aria-hidden="true" />
        <span>{game.title}</span>
      </div>
    );
  }
  return <img className={className} src={game.image} alt={game.title} loading="lazy" onError={() => setBroken(true)} />;
}
