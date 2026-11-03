import GameImage from '../common/GameImage';
import { formatMoney } from '../../utils/format';

/** Tabla de líneas de compra (checkout, resultado del pago y boleta del admin). */
export default function OrderItemsTable({ items }) {
  return (
    <div className="table-responsive">
      <table className="table app-table align-middle mb-0">
        <thead>
          <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Cantidad</th><th className="text-end">Subtotal</th></tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td><GameImage game={item} className="thumb" /></td>
              <td>{item.title}</td>
              <td>{formatMoney(item.price)}</td>
              <td>{item.quantity}</td>
              <td className="text-end">{formatMoney(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
