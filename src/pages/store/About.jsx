import PageHeader from '../../components/common/PageHeader';

const VALUES = [
  { icon: 'fa-bolt', title: 'Entrega digital', text: 'Recibe tus códigos al instante, sin esperas ni despachos.' },
  { icon: 'fa-shield-halved', title: 'Compra segura', text: 'Pagos protegidos y boleta electrónica en cada compra.' },
  { icon: 'fa-headset', title: 'Soporte cercano', text: 'Un equipo gamer que responde de lunes a sábado.' }
];

export default function About() {
  return (
    <div className="container py-5">
      <PageHeader kicker="QUIÉNES SOMOS" title="Nosotros" text="LEVEL/UP nació en Santiago en 2024 con una idea simple: comprar videojuegos debería ser tan entretenido como jugarlos." />
      <div className="row g-4 mb-5">
        {VALUES.map(value => (
          <div className="col-md-4" key={value.title}>
            <div className="surface-card h-100">
              <i className={`fa-solid ${value.icon} fs-3 text-info mb-3`} />
              <h5>{value.title}</h5>
              <p className="text-secondary mb-0">{value.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="surface-card">
        <h4>Nuestra misión</h4>
        <p className="text-secondary">Reunir en un solo lugar el catálogo de PlayStation, Xbox y Nintendo Switch, con precios claros, ofertas reales y una experiencia de compra pensada para jugadores.</p>
        <h4 className="mt-4">Nuestra visión</h4>
        <p className="text-secondary mb-0">Ser la tienda de videojuegos digital de referencia en Chile, reconocida por su comunidad y por la calidad de su servicio.</p>
      </div>
    </div>
  );
}
