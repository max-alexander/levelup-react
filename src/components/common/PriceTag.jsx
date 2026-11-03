import { finalPrice, formatMoney } from '../../utils/format';

export default function PriceTag({ game }) {
  return (
    <div className="price-tag">
      {game.discount > 0 && (
        <div className="d-flex align-items-center gap-2">
          <del className="text-secondary small">{formatMoney(game.price)}</del>
          <span className="badge text-bg-danger">-{game.discount}%</span>
        </div>
      )}
      <div className="price">{formatMoney(finalPrice(game))}</div>
    </div>
  );
}
