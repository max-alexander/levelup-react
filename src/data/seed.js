// Datos iniciales de la "base de datos" simulada.
// Las imágenes se completan con la API de RAWG desde el panel admin ("Sincronizar catálogo");
// mientras tanto, GameImage muestra un placeholder con la plataforma.

export const PLATFORMS = ['PlayStation', 'Xbox', 'Nintendo Switch'];

export const SEED_CATEGORIES = [
  { id: 1, name: 'Acción', description: 'Combate, ritmo rápido y adrenalina.', icon: 'fa-burst' },
  { id: 2, name: 'Aventura', description: 'Exploración e historias para recorrer.', icon: 'fa-compass' },
  { id: 3, name: 'RPG', description: 'Personajes que crecen contigo.', icon: 'fa-hat-wizard' },
  { id: 4, name: 'Deportes', description: 'Fútbol, básquetbol y más.', icon: 'fa-futbol' },
  { id: 5, name: 'Carreras', description: 'Velocidad en pista y fuera de ella.', icon: 'fa-flag-checkered' },
  { id: 6, name: 'Plataformas', description: 'Saltos precisos y niveles creativos.', icon: 'fa-stairs' },
  { id: 7, name: 'Shooter', description: 'Puntería y estrategia en equipo.', icon: 'fa-crosshairs' },
  { id: 8, name: 'Indie', description: 'Joyas de estudios independientes.', icon: 'fa-seedling' }
];

const g = (id, title, category, platform, price, stock, rating, description, extra = {}) => ({
  id, title, category, platform, price, stock, rating, description,
  image: '', featured: false, discount: 0, source: 'manual', ...extra
});

export const SEED_GAMES = [
  g(1, 'God of War Ragnarök', 'Acción', 'PlayStation', 59990, 14, 4.8, 'Kratos y Atreus viajan por los nueve reinos en busca de respuestas antes del Ragnarök.', { featured: true }),
  g(2, 'Marvel’s Spider-Man 2', 'Acción', 'PlayStation', 64990, 9, 4.6, 'Peter Parker y Miles Morales enfrentan nuevas amenazas en una Nueva York más grande.', { featured: true, discount: 15 }),
  g(3, 'Horizon Forbidden West', 'Aventura', 'PlayStation', 44990, 4, 4.5, 'Aloy explora un oeste prohibido lleno de máquinas y tribus desconocidas.', { discount: 25 }),
  g(4, 'Gran Turismo 7', 'Carreras', 'PlayStation', 49990, 12, 4.3, 'El simulador de conducción definitivo, con cientos de autos y circuitos reales.'),
  g(5, 'EA Sports FC 25', 'Deportes', 'PlayStation', 54990, 20, 3.9, 'Fútbol con clubes y ligas licenciadas, modo carrera y Ultimate Team.', { discount: 30 }),
  g(6, 'Halo Infinite', 'Shooter', 'Xbox', 39990, 11, 4.2, 'El Jefe Maestro regresa en la aventura más amplia de la saga Halo.'),
  g(7, 'Forza Horizon 5', 'Carreras', 'Xbox', 44990, 3, 4.7, 'Conduce por los paisajes de México en el festival Horizon.', { featured: true }),
  g(8, 'Starfield', 'RPG', 'Xbox', 59990, 7, 4.0, 'Explora la galaxia y crea tu propia historia entre las estrellas.'),
  g(9, 'Gears 5', 'Shooter', 'Xbox', 24990, 0, 4.1, 'Kait Diaz busca la verdad sobre su origen en una guerra sin cuartel.'),
  g(10, 'Hi-Fi Rush', 'Acción', 'Xbox', 29990, 16, 4.6, 'Combate al ritmo de la música en esta aventura de acción rítmica.', { discount: 20 }),
  g(11, 'The Legend of Zelda: Tears of the Kingdom', 'Aventura', 'Nintendo Switch', 69990, 10, 4.9, 'Link explora los cielos y la superficie de Hyrule con nuevas habilidades.', { featured: true }),
  g(12, 'Super Mario Bros. Wonder', 'Plataformas', 'Nintendo Switch', 59990, 18, 4.7, 'Mario y sus amigos descubren el Reino Flor y sus flores maravilla.', { featured: true }),
  g(13, 'Mario Kart 8 Deluxe', 'Carreras', 'Nintendo Switch', 54990, 25, 4.8, 'Carreras alocadas con amigos, en línea o en la misma consola.'),
  g(14, 'Pokémon Escarlata', 'RPG', 'Nintendo Switch', 59990, 5, 4.0, 'Recorre la región de Paldea en un mundo abierto lleno de Pokémon.'),
  g(15, 'Hollow Knight', 'Indie', 'Nintendo Switch', 14990, 30, 4.8, 'Explora un reino de insectos en ruinas en este metroidvania desafiante.', { discount: 10 }),
  g(16, 'Celeste', 'Plataformas', 'Nintendo Switch', 14990, 2, 4.7, 'Ayuda a Madeline a escalar la montaña Celeste y superar sus miedos.'),
  g(17, 'Stardew Valley', 'Indie', 'PlayStation', 14990, 22, 4.8, 'Hereda una granja, cultiva, pesca y forma parte de la comunidad.'),
  g(18, 'Elden Ring', 'RPG', 'Xbox', 54990, 8, 4.9, 'Recorre las Tierras Intermedias en un RPG de acción desafiante.', { featured: true, discount: 20 })
];

export const SEED_USERS = [
  {
    id: 1, name: 'Administrador', lastName: 'Sistema', email: 'admin@game.com', password: '123456', role: 'admin',
    address: { street: 'Av. Providencia 1234', apartment: 'Of. 501', region: 'Región Metropolitana', comuna: 'Providencia', notes: '' }
  },
  {
    id: 2, name: 'Usuario', lastName: 'Cliente', email: 'user@game.com', password: '123456', role: 'usuario',
    address: { street: 'Los Crisantemos 742', apartment: 'Depto 603', region: 'Región Metropolitana', comuna: 'Ñuñoa', notes: 'Dejar en conserjería' }
  }
];

export const SEED_ORDERS = [
  {
    id: 1, code: 'LV-20261001', userId: 2, status: 'pagada', date: '2026-10-01T15:20:00.000Z',
    customer: { name: 'Usuario', lastName: 'Cliente', email: 'user@game.com' },
    address: { street: 'Los Crisantemos 742', apartment: 'Depto 603', region: 'Región Metropolitana', comuna: 'Ñuñoa', notes: '' },
    items: [
      { id: 13, title: 'Mario Kart 8 Deluxe', price: 54990, quantity: 1 },
      { id: 15, title: 'Hollow Knight', price: 13491, quantity: 2 }
    ],
    subtotal: 81972, couponDiscount: 0, total: 81972
  },
  {
    id: 2, code: 'LV-20261015', userId: 2, status: 'pagada', date: '2026-10-15T19:05:00.000Z',
    customer: { name: 'Usuario', lastName: 'Cliente', email: 'user@game.com' },
    address: { street: 'Los Crisantemos 742', apartment: 'Depto 603', region: 'Región Metropolitana', comuna: 'Ñuñoa', notes: '' },
    items: [{ id: 1, title: 'God of War Ragnarök', price: 59990, quantity: 1 }],
    subtotal: 59990, couponDiscount: 0, total: 59990
  }
];

export const BLOG_POSTS = [
  {
    id: 1, slug: 'guia-elegir-consola', title: 'Guía: ¿qué consola elegir en 2026?', date: '2026-09-12', author: 'Equipo LEVEL/UP',
    summary: 'Comparamos PlayStation, Xbox y Nintendo Switch según catálogo, precio y forma de jugar.',
    body: [
      'Elegir consola depende de cómo juegas. PlayStation destaca por sus exclusivos narrativos de gran presupuesto, ideales si buscas historias cinematográficas.',
      'Xbox apuesta por el ecosistema: una suscripción con cientos de juegos y la posibilidad de continuar tus partidas en PC o en la nube.',
      'Nintendo Switch es la opción híbrida: juega en la TV o en modo portátil, con franquicias familiares que difícilmente encontrarás en otra plataforma.',
      'Nuestra recomendación: revisa qué exclusivos te interesan y cuánto tiempo juegas fuera de casa. Esa respuesta suele decidir la compra.'
    ]
  },
  {
    id: 2, slug: 'indies-imperdibles', title: '5 juegos indie que no te puedes perder', date: '2026-10-03', author: 'Equipo LEVEL/UP',
    summary: 'Pequeños estudios, grandes experiencias: nuestra selección de indies para todas las plataformas.',
    body: [
      'Los juegos independientes demuestran que la creatividad no depende del presupuesto.',
      'Hollow Knight ofrece un mundo enorme y combates exigentes; Celeste combina plataformas precisas con una historia sobre la ansiedad.',
      'Stardew Valley es perfecto para relajarse, mientras que Hades y Dead Cells redefinen el género roguelike.',
      'Todos están disponibles en nuestra tienda a precios accesibles, y varios aparecen en la sección de ofertas.'
    ]
  }
];
