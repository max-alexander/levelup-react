import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <Link className="brand mb-3 d-inline-flex" to="/"><span className="brand-mark"><i className="fa-solid fa-gamepad" /></span><span>LEVEL/UP</span></Link>
            <p>Videojuegos para PlayStation, Xbox y Nintendo, reunidos en una experiencia simple y directa.</p>
          </div>
          <div className="col-6 col-lg-3">
            <h6>Explorar</h6>
            <Link to="/productos">Productos</Link>
            <Link to="/categorias">Categorías</Link>
            <Link to="/ofertas">Ofertas</Link>
            <Link to="/blogs">Blog</Link>
          </div>
          <div className="col-6 col-lg-4">
            <h6>Ayuda</h6>
            <Link to="/contacto">Contacto</Link>
            <Link to="/nosotros">Nosotros</Link>
            <span>soporte@levelup.cl</span>
            <span>Santiago, Chile</span>
          </div>
        </div>
        <hr />
        <div className="footer-bottom">
          <span>© 2026 LEVEL/UP</span>
          <a href="https://rawg.io" target="_blank" rel="noopener noreferrer">Portadas de videojuegos por RAWG</a>
        </div>
      </div>
    </footer>
  );
}
