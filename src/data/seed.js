// Datos iniciales de la "base de datos" simulada.
// Las portadas están incluidas en public/assets/games/{id}.jpg (no requieren internet).
// Los productos creados sin imagen desde el admin muestran un placeholder por plataforma.

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
  image: `/assets/games/${id}.jpg`, featured: false, discount: 0, source: 'local', ...extra
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
  g(18, 'Elden Ring', 'RPG', 'Xbox', 54990, 8, 4.9, 'Recorre las Tierras Intermedias en un RPG de acción desafiante.', { featured: true, discount: 20 }),
  // PlayStation
  g(19, 'The Last of Us Part I', 'Aventura', 'PlayStation', 49990, 11, 4.8, 'Joel y Ellie cruzan unos Estados Unidos devastados en esta versión rehecha del clásico.', { featured: true }),
  g(20, 'Ghost of Tsushima', 'Acción', 'PlayStation', 39990, 15, 4.7, 'Jin Sakai defiende la isla de Tsushima de la invasión mongola en el Japón feudal.', { discount: 30 }),
  g(21, 'Ratchet & Clank: Rift Apart', 'Plataformas', 'PlayStation', 44990, 9, 4.6, 'Salta entre dimensiones con Ratchet, Clank y Rivet en una aventura llena de armas.'),
  g(22, 'Final Fantasy XVI', 'RPG', 'PlayStation', 54990, 6, 4.3, 'Clive Rosfield busca venganza en Valisthea, un mundo dominado por los Eikons.'),
  g(23, 'Returnal', 'Shooter', 'PlayStation', 34990, 4, 4.4, 'Selene queda atrapada en un bucle temporal en un planeta alienígena hostil.', { discount: 20 }),
  g(24, 'Astro Bot', 'Plataformas', 'PlayStation', 59990, 13, 4.9, 'Astro rescata a su tripulación en un viaje por galaxias llenas de creatividad.', { featured: true }),
  g(25, 'Demon’s Souls', 'RPG', 'PlayStation', 49990, 3, 4.5, 'Remake del clásico que inició el género soulslike, en el reino de Boletaria.'),
  g(26, 'NBA 2K25', 'Deportes', 'PlayStation', 49990, 21, 3.8, 'Básquetbol con equipos de la NBA, modo carrera y MyTEAM.', { discount: 25 }),
  g(27, 'Uncharted 4: A Thief’s End', 'Aventura', 'PlayStation', 24990, 17, 4.7, 'Nathan Drake vuelve para una última búsqueda del tesoro pirata de Henry Avery.'),
  g(28, 'Hades', 'Indie', 'PlayStation', 19990, 24, 4.9, 'Zagreo intenta escapar del inframundo en este roguelike de acción.'),
  // Xbox
  g(29, 'Halo: The Master Chief Collection', 'Shooter', 'Xbox', 29990, 14, 4.6, 'Las campañas clásicas del Jefe Maestro reunidas en una sola colección.'),
  g(30, 'Sea of Thieves', 'Aventura', 'Xbox', 29990, 19, 4.2, 'Forma una tripulación pirata y navega en busca de tesoros en línea.', { discount: 35 }),
  g(31, 'Forza Motorsport', 'Carreras', 'Xbox', 54990, 7, 4.1, 'Simulación de carreras en circuitos reales con cientos de autos.'),
  g(32, 'Indiana Jones and the Great Circle', 'Aventura', 'Xbox', 64990, 10, 4.5, 'Indy recorre el mundo para resolver un misterio ancestral en 1937.', { featured: true }),
  g(33, 'Avowed', 'RPG', 'Xbox', 59990, 5, 4.1, 'Explora las Tierras Vivientes, un mundo de fantasía con magia y espadas.'),
  g(34, 'Cuphead', 'Indie', 'Xbox', 14990, 26, 4.6, 'Jefes desafiantes con animación inspirada en los dibujos animados de los años 30.'),
  g(35, 'Ori and the Will of the Wisps', 'Plataformas', 'Xbox', 19990, 12, 4.8, 'Ori emprende un viaje para descubrir su destino en un bosque encantado.', { discount: 15 }),
  g(36, 'Call of Duty: Black Ops 6', 'Shooter', 'Xbox', 69990, 18, 4.0, 'Espionaje y acción en los años 90, con campaña, multijugador y zombis.'),
  g(37, 'Rocket League', 'Deportes', 'Xbox', 9990, 30, 4.3, 'Fútbol con autos propulsados por cohetes, en partidas rápidas en línea.'),
  g(38, 'Diablo IV', 'RPG', 'Xbox', 44990, 2, 4.2, 'Enfréntate a Lilith en el regreso de la saga de rol de acción más oscura.', { discount: 40 }),
  // Nintendo Switch
  g(39, 'Metroid Dread', 'Acción', 'Nintendo Switch', 49990, 8, 4.7, 'Samus Aran explora el planeta ZDR mientras huye de los implacables E.M.M.I.'),
  g(40, 'Animal Crossing: New Horizons', 'Aventura', 'Nintendo Switch', 54990, 16, 4.6, 'Construye tu vida en una isla desierta junto a vecinos encantadores.'),
  g(41, 'Super Smash Bros. Ultimate', 'Acción', 'Nintendo Switch', 59990, 20, 4.8, 'Todos los luchadores de la saga reunidos en un juego de peleas para todos.', { featured: true }),
  g(42, 'Pikmin 4', 'Aventura', 'Nintendo Switch', 54990, 9, 4.5, 'Dirige a los Pikmin para rescatar a tu tripulación en un planeta misterioso.'),
  g(43, 'Xenoblade Chronicles 3', 'RPG', 'Nintendo Switch', 54990, 4, 4.6, 'Noah y Mio luchan en una guerra eterna entre las naciones de Keves y Agnus.', { discount: 25 }),
  g(44, 'Kirby and the Forgotten Land', 'Plataformas', 'Nintendo Switch', 54990, 15, 4.6, 'Kirby explora un mundo en 3D y absorbe objetos con su nuevo poder.'),
  g(45, 'Splatoon 3', 'Shooter', 'Nintendo Switch', 54990, 11, 4.4, 'Batallas de tinta en equipo, con campaña y modos competitivos.'),
  g(46, 'Nintendo Switch Sports', 'Deportes', 'Nintendo Switch', 39990, 22, 4.0, 'Tenis, bowling, fútbol y más, jugados con movimiento.'),
  g(47, 'Donkey Kong Country: Tropical Freeze', 'Plataformas', 'Nintendo Switch', 44990, 7, 4.6, 'Donkey Kong y su familia recuperan su isla congelada por los Snowmads.', { discount: 20 }),
  g(48, 'Dead Cells', 'Indie', 'Nintendo Switch', 19990, 25, 4.5, 'Roguelike de acción en un castillo que cambia en cada partida.')
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
      { id: 13, title: 'Mario Kart 8 Deluxe', image: '/assets/games/13.jpg', platform: 'Nintendo Switch', price: 54990, quantity: 1 },
      { id: 15, title: 'Hollow Knight', image: '/assets/games/15.jpg', platform: 'Nintendo Switch', price: 13491, quantity: 2 }
    ],
    subtotal: 81972, couponDiscount: 0, total: 81972, authorization: 'AUT-104521'
  },
  {
    id: 2, code: 'LV-20261015', userId: 2, status: 'pagada', date: '2026-10-15T19:05:00.000Z',
    customer: { name: 'Usuario', lastName: 'Cliente', email: 'user@game.com' },
    address: { street: 'Los Crisantemos 742', apartment: 'Depto 603', region: 'Región Metropolitana', comuna: 'Ñuñoa', notes: '' },
    items: [{ id: 1, title: 'God of War Ragnarök', image: '/assets/games/1.jpg', platform: 'PlayStation', price: 59990, quantity: 1 }],
    subtotal: 59990, couponDiscount: 0, total: 59990, authorization: 'AUT-118734'
  }
];

export const SEED_REVIEWS = [
  { id: 1, gameId: 11, userId: 2, userName: 'Usuario C.', rating: 5, comment: 'La libertad para construir y explorar es increíble. Cada isla del cielo esconde algo nuevo.', date: '2026-10-04T18:30:00.000Z' },
  { id: 2, gameId: 11, userId: 1, userName: 'Administrador S.', rating: 4, comment: 'Excelente secuela, aunque algunas zonas del subsuelo se sienten repetitivas.', date: '2026-10-12T21:10:00.000Z' },
  { id: 3, gameId: 1, userId: 2, userName: 'Usuario C.', rating: 5, comment: 'La historia entre Kratos y Atreus es lo mejor de la saga. El combate es muy satisfactorio.', date: '2026-10-18T14:00:00.000Z' },
  { id: 4, gameId: 24, userId: 1, userName: 'Administrador S.', rating: 5, comment: 'Divertido de principio a fin y lleno de guiños a PlayStation. Ideal para jugar en familia.', date: '2026-10-20T16:45:00.000Z' },
  { id: 5, gameId: 15, userId: 2, userName: 'Usuario C.', rating: 4, comment: 'Difícil pero justo. El mapa es enorme y la música acompaña muy bien.', date: '2026-10-22T23:05:00.000Z' }
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
