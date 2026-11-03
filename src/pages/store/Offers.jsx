import GameGrid from '../../components/store/GameGrid';
import PageHeader from '../../components/common/PageHeader';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { finalPrice, formatMoney } from '../../utils/format';

export default function Offers() {
  const games = useCollection(db.games);
  const offers = games.filter(game => game.discount > 0).sort((a, b) => b.discount - a.discount);
  const savings = offers.reduce((sum, game) => sum + (game.price - finalPrice(game)), 0);

  return (
    <div className="container py-5">
      <PageHeader kicker="AHORRA" title="Ofertas" text={`${offers.length} juegos con descuento · ahorro total de ${formatMoney(savings)} si compras uno de cada uno.`} />
      <div className="alert offer-alert mb-4">
        <i className="fa-solid fa-ticket me-2" />Usa el cupón <strong>LEVEL10</strong> en el carrito para obtener un 10% adicional.
      </div>
      <GameGrid games={offers} emptyTitle="No hay ofertas activas" emptyText="Vuelve pronto para nuevas promociones." />
    </div>
  );
}
