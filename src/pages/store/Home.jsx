import { Link } from 'react-router-dom';
import GameGrid from '../../components/store/GameGrid';
import CategoryCard from '../../components/store/CategoryCard';
import PageHeader from '../../components/common/PageHeader';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { BLOG_POSTS } from '../../data/seed';
import { sortGames } from '../../utils/catalog';

export default function Home() {
  const games = useCollection(db.games);
  const categories = useCollection(db.categories);
  const featured = sortGames(games, 'featured').slice(0, 6);
  const offers = games.filter(game => game.discount > 0).length;

  return (
    <div className="container py-4 py-lg-5">
      <section className="hero-store mb-5">
        <div className="hero-copy">
          <span className="hero-kicker">PLAYSTATION · XBOX · NINTENDO</span>
          <h1>Tu próxima historia empieza aquí.</h1>
          <p>Descubre grandes lanzamientos, clásicos y favoritos de cada plataforma en un solo lugar.</p>
          <div className="d-flex flex-wrap gap-2 mt-4">
            <Link className="btn btn-primary btn-lg" to="/productos">Explorar catálogo <i className="fa-solid fa-arrow-right ms-2" /></Link>
            <Link className="btn btn-soft btn-lg" to="/ofertas"><i className="fa-solid fa-bolt me-2" />Ver {offers} ofertas</Link>
          </div>
          <div className="hero-proof mt-4">
            <span><i className="fa-solid fa-bolt" /> Entrega digital</span>
            <span><i className="fa-solid fa-shield-halved" /> Compra segura</span>
            <span><i className="fa-solid fa-headset" /> Soporte</span>
          </div>
        </div>
        <div className="hero-media">
          <video className="hero-video" autoPlay muted loop playsInline controls preload="metadata">
            <source src="/assets/levelup-promo.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-badge"><i className="fa-solid fa-circle-play" /><span>LEVEL/UP SELECTS</span></div>
        </div>
      </section>

      <section className="mb-5">
        <PageHeader kicker="EXPLORA" title="Categorías">
          <Link className="btn btn-soft" to="/categorias">Ver todas</Link>
        </PageHeader>
        <div className="category-grid">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} count={games.filter(game => game.category === category.name).length} />
          ))}
        </div>
      </section>

      <section className="mb-5">
        <PageHeader kicker="SELECCIÓN" title="Destacados">
          <Link className="btn btn-soft" to="/productos">Ver catálogo completo</Link>
        </PageHeader>
        <GameGrid games={featured} />
      </section>

      <section>
        <PageHeader kicker="NOVEDADES" title="Desde el blog" />
        <div className="row g-4">
          {BLOG_POSTS.map(post => (
            <div className="col-md-6" key={post.id}>
              <Link to={`/blogs/${post.slug}`} className="surface-card d-block h-100 text-decoration-none text-reset blog-teaser">
                <small className="section-kicker">{post.date}</small>
                <h4 className="mt-2">{post.title}</h4>
                <p className="text-secondary mb-0">{post.summary}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
