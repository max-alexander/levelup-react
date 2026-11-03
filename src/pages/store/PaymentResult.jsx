import { Link, useNavigate, useParams } from 'react-router-dom';
import OrderSummary from '../../components/store/OrderSummary';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';

/** Vista de resultado del pago. success=true → compra exitosa; false → pago con error. */
export default function PaymentResult({ success }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const order = db.orders.getById(id);

  if (!order || (success && order.status !== 'pagada') || (!success && order.status !== 'rechazada')) {
    return (
      <div className="container py-5">
        <EmptyState icon="fa-receipt" title="Orden no disponible" text="No encontramos la orden solicitada.">
          <Link className="btn btn-primary" to="/">Volver al inicio</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="checkout-card mx-auto">
        {success ? (
          <>
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <h3 className="text-success-emphasis"><i className="fa-regular fa-circle-check text-success me-2" />Se ha realizado la compra. nro #{order.id}</h3>
              <small className="text-secondary">Código orden: {order.code}</small>
            </div>
            <p className="text-secondary">Autorización {order.authorization}. Te enviamos el detalle a {order.customer.email}.</p>
          </>
        ) : (
          <>
            <h3><i className="fa-regular fa-circle-xmark text-danger me-2" />No se pudo realizar el pago. nro #{order.id}</h3>
            <p className="text-secondary">{order.paymentMessage} Tus productos siguen en el carrito.</p>
            <div className="text-center my-3">
              <button type="button" className="btn btn-success btn-lg" onClick={() => navigate(`/checkout?reintento=${order.id}`)}>VOLVER A REALIZAR EL PAGO</button>
            </div>
          </>
        )}
        <OrderSummary order={order} totalLabel={success ? 'Total pagado' : 'Total a pagar'} />
        {success && (
          <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap no-print">
            <button type="button" className="btn btn-danger" onClick={() => window.print()}><i className="fa-solid fa-file-pdf me-2" />Imprimir boleta en PDF</button>
            <button type="button" className="btn btn-success" onClick={() => notify('Boleta enviada', `Se envió la boleta a ${order.customer.email}.`, 'success')}><i className="fa-solid fa-envelope me-2" />Enviar boleta por email</button>
            <Link className="btn btn-soft" to="/productos">Seguir comprando</Link>
          </div>
        )}
      </div>
    </div>
  );
}
