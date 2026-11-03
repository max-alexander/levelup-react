import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { BLOG_POSTS } from '../../data/seed';

export function BlogList() {
  return (
    <div className="container py-5">
      <PageHeader kicker="NOTICIAS" title="Blog" text="Guías, recomendaciones y novedades del mundo gamer." />
      <div className="row g-4">
        {BLOG_POSTS.map(post => (
          <div className="col-md-6" key={post.id}>
            <article className="surface-card h-100 d-flex flex-column">
              <div className="blog-cover mb-3"><i className="fa-solid fa-newspaper" /></div>
              <small className="section-kicker">{post.date} · {post.author}</small>
              <h4 className="mt-2">{post.title}</h4>
              <p className="text-secondary">{post.summary}</p>
              <Link className="btn btn-soft mt-auto align-self-start" to={`/blogs/${post.slug}`}>Leer más</Link>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogDetail() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(item => item.slug === slug);
  if (!post) {
    return (
      <div className="container py-5">
        <EmptyState icon="fa-newspaper" title="Artículo no encontrado"><Link className="btn btn-primary" to="/blogs">Volver al blog</Link></EmptyState>
      </div>
    );
  }
  return (
    <div className="container py-5">
      <article className="surface-card blog-article mx-auto">
        <Link to="/blogs" className="small"><i className="fa-solid fa-arrow-left me-1" />Volver al blog</Link>
        <small className="section-kicker d-block mt-3">{post.date} · {post.author}</small>
        <h1 className="detail-title mt-2 mb-4">{post.title}</h1>
        {post.body.map(paragraph => <p key={paragraph.slice(0, 20)} className="text-secondary">{paragraph}</p>)}
      </article>
    </div>
  );
}
