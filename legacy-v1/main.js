class Game {
  constructor(id, title, category, price, image, description, platform = 'PlayStation', stock = 10, rating = 4.5, featured = false, rawgId = null, released = null, metacritic = null, source = 'manual') {
    Object.assign(this, { id, title, category, price, image, description, platform, stock, rating, featured, rawgId, released, metacritic, source });
  }
}

class User {
  constructor(id, name, email, password, role = 'usuario') {
    Object.assign(this, { id, name, email, password, role });
  }
}

class StorageService {
  static get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

const RAWG_API_KEY = '4ebcdb66f44a4f1586bd20cdd53d732f';
const RAWG_API_URL = 'https://api.rawg.io/api/games';
const VERSION = 'v8';
const CATALOG_KEY = `lv_games_${VERSION}`;
const CATEGORY_KEY = `lv_categories_${VERSION}`;
const SYNC_KEY = `lv_sync_${VERSION}`;
const PAGE_SIZE = 12;
const API_TARGET = 100;
const API_MIN_ACCEPTABLE = 24;
const API_TIMEOUT_MS = 12000;
const API_RETRIES = 2;
let syncInProgress = false;
const brokenImageIds = new Set();

const PLATFORM_QUERIES = [
  { label: 'PlayStation', ids: '187,18', target: 34 },
  { label: 'Xbox', ids: '186,1', target: 33 },
  { label: 'Nintendo Switch', ids: '7', target: 33 }
];

const DEFAULT_CATEGORIES = ['Acción', 'Aventura', 'Arcade', 'Carreras', 'Deportes', 'Estrategia', 'Familiar', 'Indie', 'Lucha', 'Plataformas', 'Puzzle', 'RPG', 'Shooter', 'Simulación'];

const DEFAULT_USERS = [
  new User(1, 'Administrador Sistema', 'admin@game.com', '123456', 'admin'),
  new User(2, 'Usuario Cliente', 'user@game.com', '123456', 'usuario')
];

let games = StorageService.get(CATALOG_KEY, []);
let categories = StorageService.get(CATEGORY_KEY, DEFAULT_CATEGORIES);
let users = StorageService.get(`lv_users_${VERSION}`, DEFAULT_USERS);
let cart = StorageService.get(`lv_cart_${VERSION}`, []);
let currentUser = StorageService.get(`lv_user_${VERSION}`, null);
let favorites = StorageService.get(`lv_favorites_${VERSION}`, []);
let orders = StorageService.get(`lv_orders_${VERSION}`, []);
let coupon = null;
let catalogView = 'grid';
let currentPage = 1;
let filteredCatalog = [];
let modals = {};

window.addEventListener('DOMContentLoaded', async () => {
  modals = {
    login: new bootstrap.Modal('#loginModal'),
    cart: new bootstrap.Modal('#cartModal'),
    checkout: new bootstrap.Modal('#checkoutModal'),
    game: new bootstrap.Modal('#gameModal'),
    category: new bootstrap.Modal('#categoryModal'),
    user: new bootstrap.Modal('#userModal'),
    detail: new bootstrap.Modal('#gameDetailModal'),
    confirm: new bootstrap.Modal('#confirmModal')
  };

  bindInputs();
  normalizeData();
  renderAll();
  updateUI();

  const rawgCount = games.filter(g => g.source === 'rawg').length;
  const lastSync = Number(StorageService.get(SYNC_KEY, 0));
  if (rawgCount) setCatalogStatus('success', `${rawgCount} juegos disponibles`);
  else setCatalogStatus('loading', 'Cargando catálogo...');

  if (rawgCount < API_TARGET || Date.now() - lastSync > 6 * 60 * 60 * 1000) {
    await syncRawgCatalog({ silent: rawgCount > 0 });
  }
});

function bindInputs() {
  document.getElementById('game-description').addEventListener('input', e => {
    document.getElementById('description-count').textContent = e.target.value.length;
  });
  document.getElementById('card-number').addEventListener('input', e => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = d.replace(/(.{4})/g, '$1 ').trim();
  });
  document.getElementById('card-expiry').addEventListener('input', e => {
    let d = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (d.length > 2) d = `${d.slice(0, 2)}/${d.slice(2)}`;
    e.target.value = d;
  });
  document.getElementById('card-cvv').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
  });
}

function normalizeData() {
  games = (Array.isArray(games) ? games : [])
    .filter(g => g && g.title && String(g.image || '').trim())
    .map(g => ({
      ...g,
      image: String(g.image || '').trim(),
      price: Number(g.price) || 29990,
      stock: Math.max(0, Number(g.stock) || 0),
      rating: Math.min(5, Math.max(1, Number(g.rating) || 4)),
      platform: g.platform || 'PlayStation',
      category: g.category || 'Aventura',
      description: g.description || 'Descubre una nueva experiencia de juego.',
      source: g.source || 'manual'
    }));

  categories = [...new Set([...(Array.isArray(categories) ? categories : []), ...DEFAULT_CATEGORIES, ...games.map(g => g.category)])].sort((a, b) => a.localeCompare(b, 'es'));
  persist();
}

function persist() {
  StorageService.set(CATALOG_KEY, games);
  StorageService.set(CATEGORY_KEY, categories);
  StorageService.set(`lv_users_${VERSION}`, users);
  StorageService.set(`lv_cart_${VERSION}`, cart);
  StorageService.set(`lv_user_${VERSION}`, currentUser);
  StorageService.set(`lv_favorites_${VERSION}`, favorites);
  StorageService.set(`lv_orders_${VERSION}`, orders);
}

async function syncRawgCatalog({ silent = false, force = false } = {}) {
  if (syncInProgress) return;
  syncInProgress = true;

  const btn = document.getElementById('rawg-sync-btn');
  setCatalogStatus('loading', 'Actualizando catálogo...');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Actualizando...';
  }

  try {
    const byPlatform = new Map();
    const diagnostics = [];

    for (const group of PLATFORM_QUERIES) {
      // Incluimos las primeras páginas (más estables) y otras aleatorias para variar el catálogo.
      const pages = [...new Set([1, 2, 3, ...randomUniquePages(5, 20)])];
      const settled = await Promise.allSettled(
        pages.map(page => fetchRawgPage(group, page))
      );

      const successful = settled
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      const failed = settled.length - successful.length;
      diagnostics.push(`${group.label}: ${successful.length}/${settled.length}${failed ? ` (${failed} fallidas)` : ''}`);

      const candidates = successful
        .flatMap(data => Array.isArray(data?.results) ? data.results : [])
        .filter(item => item?.id && item?.name && isHttpUrl(item?.background_image || ''))
        .map(item => rawgToGame(item, group.label));

      const unique = [...new Map(candidates.map(game => [game.rawgId, game])).values()];
      byPlatform.set(group.label, shuffle(unique));
    }

    const imported = selectBalancedGames(byPlatform, API_TARGET);
    const manualGames = games.filter(g => g.source === 'manual' && !g.rawgId);
    const cachedRawg = games.filter(g => g.source === 'rawg');

    if (imported.length >= API_MIN_ACCEPTABLE) {
      // Si no llegamos a 100, completamos con el caché previo sin duplicar títulos.
      const mergedRawg = mergeCatalogs(imported, cachedRawg, API_TARGET);
      games = [...mergedRawg, ...manualGames];
      categories = [...new Set([...categories, ...mergedRawg.map(g => g.category)])].sort((a, b) => a.localeCompare(b, 'es'));
      brokenImageIds.clear();
      StorageService.set(SYNC_KEY, Date.now());
      persist();
      currentPage = 1;
      renderAll();
      setCatalogStatus('success', `${mergedRawg.length} juegos disponibles`);

      if (!silent) {
        const detail = mergedRawg.length >= API_TARGET
          ? `${mergedRawg.length} juegos cargados.`
          : `${mergedRawg.length} juegos disponibles. El catálogo se completará en próximas actualizaciones.`;
        showToast('Catálogo actualizado', detail, 'success');
      }
      return;
    }

    // Si la red entregó pocos datos pero ya teníamos un catálogo bueno, NO lo reemplazamos.
    if (cachedRawg.length >= API_MIN_ACCEPTABLE) {
      renderAll();
      setCatalogStatus('warning', `${cachedRawg.length} juegos disponibles · actualización parcial`);
      if (!silent) showToast('Actualización parcial', 'Conservamos el catálogo disponible y volveremos a intentar después.', 'warning');
      return;
    }

    // Incluso una respuesta parcial es preferible a dejar la tienda vacía.
    if (imported.length > 0) {
      games = [...imported, ...manualGames];
      categories = [...new Set([...categories, ...imported.map(g => g.category)])].sort((a, b) => a.localeCompare(b, 'es'));
      persist();
      renderAll();
      setCatalogStatus('warning', `${imported.length} juegos disponibles · cargando más pronto`);
      if (!silent) showToast('Catálogo parcial', `Pudimos cargar ${imported.length} juegos.`, 'warning');
      return;
    }

    throw new Error(`No se obtuvieron juegos válidos. ${diagnostics.join(' · ')}`);
  } catch (error) {
    console.error('Catalog sync failed:', error);
    renderAll();
    if (games.length) {
      setCatalogStatus('warning', `${games.length} juegos disponibles · usando catálogo guardado`);
      if (!silent) showToast('No pudimos actualizar', 'Seguimos mostrando el catálogo guardado.', 'warning');
    } else {
      setCatalogStatus('error', 'No pudimos cargar el catálogo. Reintenta en unos segundos.', true);
      showCatalogLoadError();
      if (!silent) showToast('Catálogo no disponible', 'Revisa tu conexión e intenta nuevamente.', 'danger');
    }
  } finally {
    syncInProgress = false;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrows-rotate me-2"></i>Actualizar catálogo';
    }
  }
}

async function fetchRawgPage(group, page) {
  const query = new URLSearchParams({
    key: RAWG_API_KEY,
    platforms: group.ids,
    page_size: '40',
    page: String(page),
    ordering: '-added',
    exclude_additions: 'true'
  });
  const url = `${RAWG_API_URL}?${query}`;
  let lastError;

  for (let attempt = 0; attempt <= API_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
        cache: forceFetchCacheMode()
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || !Array.isArray(data.results)) throw new Error('Respuesta inválida');
      return data;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < API_RETRIES) await wait(500 * (attempt + 1));
    }
  }
  throw lastError || new Error('No se pudo consultar el catálogo');
}

function forceFetchCacheMode() {
  // Evita respuestas obsoletas sin romper navegadores que no soporten opciones avanzadas.
  return 'no-store';
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mergeCatalogs(primary, fallback, limit = API_TARGET) {
  const result = [];
  const usedTitles = new Set();
  const usedKeys = new Set();
  for (const game of [...primary, ...fallback]) {
    if (!game?.title || !game?.image) continue;
    const titleKey = game.title.trim().toLowerCase();
    const key = `${game.rawgId || game.id}:${game.platform}`;
    if (usedTitles.has(titleKey) || usedKeys.has(key)) continue;
    usedTitles.add(titleKey);
    usedKeys.add(key);
    result.push(game);
    if (result.length >= limit) break;
  }
  return result;
}

function setCatalogStatus(type, text, retry = false) {
  const el = document.getElementById('catalog-status');
  if (!el) return;
  el.className = `catalog-status catalog-status-${type}`;
  el.innerHTML = `<span class="status-dot"></span><span>${escapeHTML(text)}</span>${retry ? '<button class="status-retry" onclick="syncRawgCatalog({silent:false,force:true})">Reintentar</button>' : ''}`;
}

function showCatalogLoadError() {
  const container = document.getElementById('games-container');
  if (!container || games.length) return;
  container.className = 'row';
  container.innerHTML = `<div class="col-12"><div class="catalog-load-error"><i class="fa-solid fa-cloud-arrow-down"></i><h3>No pudimos cargar los juegos</h3><p>Comprueba tu conexión y vuelve a intentarlo.</p><button class="btn btn-primary" onclick="syncRawgCatalog({silent:false,force:true})"><i class="fa-solid fa-arrows-rotate me-2"></i>Reintentar</button></div></div>`;
}

function randomUniquePages(count, maxPage) {
  const values = new Set();
  while (values.size < count) values.add(1 + Math.floor(Math.random() * maxPage));
  return [...values];
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function selectBalancedGames(byPlatform, target) {
  const selected = [];
  const usedTitles = new Set();
  const queues = PLATFORM_QUERIES.map(group => ({ ...group, items: byPlatform.get(group.label) || [] }));

  for (const queue of queues) {
    for (const game of queue.items) {
      if (selected.filter(g => g.platform === queue.label).length >= queue.target) break;
      const titleKey = game.title.toLowerCase();
      if (usedTitles.has(titleKey)) continue;
      selected.push(game);
      usedTitles.add(titleKey);
    }
  }

  if (selected.length < target) {
    const leftovers = shuffle(queues.flatMap(q => q.items));
    for (const game of leftovers) {
      if (selected.length >= target) break;
      const titleKey = game.title.toLowerCase();
      if (usedTitles.has(titleKey)) continue;
      selected.push(game);
      usedTitles.add(titleKey);
    }
  }

  return shuffle(selected).slice(0, target);
}

function rawgToGame(item, platform) {
  const category = translateGenre(item.genres?.[0]?.name);
  const rating = Math.max(1, Math.min(5, Number(item.rating) || 4));
  const price = assignPrice(item, platform);
  const stock = 8 + (Number(item.id) % 23);
  const year = item.released ? String(item.released).slice(0, 4) : null;
  const description = `${category} para ${platform}.${year ? ` Lanzado en ${year}.` : ''}${item.metacritic ? ` Metacritic ${item.metacritic}.` : ''} Disponible en formato digital.`;
  const platformOffset = platform === 'Xbox' ? 2_000_000 : platform === 'Nintendo Switch' ? 4_000_000 : 0;

  return new Game(
    1_000_000 + Number(item.id) + platformOffset,
    item.name,
    category,
    price,
    item.background_image,
    description,
    platform,
    stock,
    rating,
    (item.metacritic || 0) >= 85 || rating >= 4.45,
    Number(item.id),
    item.released,
    item.metacritic,
    'rawg'
  );
}

function translateGenre(name = 'Aventura') {
  const map = {
    Action: 'Acción', Adventure: 'Aventura', Arcade: 'Arcade', Casual: 'Casual',
    'Role-playing (RPG)': 'RPG', RPG: 'RPG', Racing: 'Carreras', Sports: 'Deportes',
    Strategy: 'Estrategia', Simulation: 'Simulación', Indie: 'Indie', Puzzle: 'Puzzle',
    Shooter: 'Shooter', Platformer: 'Plataformas', Fighting: 'Lucha', Family: 'Familiar',
    Educational: 'Educativo', Card: 'Cartas', 'Board Games': 'Mesa',
    'Massively Multiplayer': 'Multijugador'
  };
  return map[name] || name || 'Aventura';
}

function assignPrice(item, platform) {
  const year = Number(String(item.released || '').slice(0, 4)) || 2021;
  const now = new Date().getFullYear();
  const meta = Number(item.metacritic) || 0;
  let price = year >= now - 1 ? 59990 : year >= now - 4 ? 44990 : 29990;
  if (meta >= 90) price += 10000;
  else if (meta >= 82) price += 5000;
  if ((item.genres || []).some(g => g.name === 'Indie')) price -= 10000;
  if (platform === 'Nintendo Switch') price += 5000;
  const pricePoints = [14990, 19990, 24990, 29990, 34990, 39990, 44990, 49990, 54990, 59990, 64990, 69990];
  return pricePoints.reduce((a, b) => Math.abs(b - price) < Math.abs(a - price) ? b : a);
}

function renderAll() {
  populateFilters();
  filterGames(false);
  renderFavorites();
  renderLibrary();
  renderAdminTables();
  renderAdminStats();
  renderOrders();
  updateCartUI();
}

function populateFilters() {
  const platformSelect = document.getElementById('platform-filter');
  const categorySelect = document.getElementById('category-filter');
  const productCategorySelect = document.getElementById('game-category');
  const previousPlatform = platformSelect.value;
  const previousCategory = categorySelect.value;
  const previousProductCategory = productCategorySelect.value;
  const platforms = [...new Set(games.map(g => g.platform))].sort();

  platformSelect.innerHTML = '<option value="all">Todas las plataformas</option>' + platforms.map(value => `<option value="${escapeAttr(value)}">${escapeHTML(value)}</option>`).join('');
  categorySelect.innerHTML = '<option value="all">Todas las categorías</option>' + categories.map(value => {
    const count = games.filter(g => g.category === value).length;
    return `<option value="${escapeAttr(value)}">${escapeHTML(value)} (${count})</option>`;
  }).join('');
  productCategorySelect.innerHTML = '<option value="">Selecciona una categoría</option>' + categories.map(value => `<option value="${escapeAttr(value)}">${escapeHTML(value)}</option>`).join('');

  if (platforms.includes(previousPlatform)) platformSelect.value = previousPlatform;
  if (categories.includes(previousCategory)) categorySelect.value = previousCategory;
  if (categories.includes(previousProductCategory)) productCategorySelect.value = previousProductCategory;
}

function filterGames(resetPage = false) {
  if (resetPage) currentPage = 1;
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const platform = document.getElementById('platform-filter').value;
  const category = document.getElementById('category-filter').value;
  const sort = document.getElementById('sort-filter').value;

  filteredCatalog = games.filter(game => {
    if (brokenImageIds.has(game.id)) return false;
    const haystack = `${game.title} ${game.category} ${game.platform} ${game.description}`.toLowerCase();
    return (!query || haystack.includes(query)) &&
      (platform === 'all' || game.platform === platform) &&
      (category === 'all' || game.category === category);
  });

  if (sort === 'rating') filteredCatalog.sort((a, b) => b.rating - a.rating);
  else if (sort === 'price-asc') filteredCatalog.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filteredCatalog.sort((a, b) => b.price - a.price);
  else if (sort === 'name') filteredCatalog.sort((a, b) => a.title.localeCompare(b.title));
  else filteredCatalog.sort((a, b) => (b.featured - a.featured) || (b.rating - a.rating));

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  renderCatalog(filteredCatalog.slice(start, start + PAGE_SIZE));
  renderPagination(totalPages);

  const from = filteredCatalog.length ? start + 1 : 0;
  const to = Math.min(start + PAGE_SIZE, filteredCatalog.length);
  document.getElementById('catalog-count').textContent = filteredCatalog.length ? `${from}–${to} de ${filteredCatalog.length} juegos` : '0 juegos encontrados';
}

function handleBrokenGameImage(id, imageElement) {
  if (imageElement) imageElement.closest('.col, .cart-item, .table-game')?.classList.add('d-none');
  // Una caída temporal del CDN no debe borrar un juego de forma permanente.
  brokenImageIds.add(id);
  window.setTimeout(() => filterGames(false), 0);
}

function renderCatalog(data) {
  const container = document.getElementById('games-container');
  container.className = catalogView === 'grid' ? 'row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4' : 'row row-cols-1 g-3';
  container.innerHTML = data.length
    ? data.map(game => `<div class="col">${gameCard(game)}</div>`).join('')
    : emptyState('fa-magnifying-glass', 'No encontramos juegos', 'Prueba con otros filtros o términos de búsqueda.');
}

function renderPagination(totalPages) {
  const element = document.getElementById('catalog-pagination');
  if (totalPages <= 1) {
    element.innerHTML = '';
    return;
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  if (start > 1) pages.push(1);
  if (start > 2) pages.push('...');
  for (let page = start; page <= end; page++) pages.push(page);
  if (end < totalPages - 1) pages.push('...');
  if (end < totalPages) pages.push(totalPages);

  element.innerHTML = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="goToPage(${currentPage - 1})"><i class="fa-solid fa-chevron-left"></i></button></li>` +
    pages.map(page => page === '...'
      ? '<li class="page-item disabled"><span class="page-link">…</span></li>'
      : `<li class="page-item ${page === currentPage ? 'active' : ''}"><button class="page-link" onclick="goToPage(${page})">${page}</button></li>`).join('') +
    `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><button class="page-link" onclick="goToPage(${currentPage + 1})"><i class="fa-solid fa-chevron-right"></i></button></li>`;
}

function goToPage(page) {
  const total = Math.ceil(filteredCatalog.length / PAGE_SIZE);
  if (page < 1 || page > total) return;
  currentPage = page;
  filterGames(false);
  document.getElementById('catalog-anchor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setCatalogView(view) {
  catalogView = view;
  document.getElementById('grid-view-btn').classList.toggle('active', view === 'grid');
  document.getElementById('list-view-btn').classList.toggle('active', view === 'list');
  filterGames(false);
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('platform-filter').value = 'all';
  document.getElementById('category-filter').value = 'all';
  document.getElementById('sort-filter').value = 'featured';
  currentPage = 1;
  filterGames(false);
}

function applyFeatured() {
  document.getElementById('sort-filter').value = 'featured';
  document.getElementById('search-input').value = '';
  currentPage = 1;
  filterGames(false);
  scrollToCatalog();
}

function scrollToCatalog() {
  document.getElementById('catalog-anchor').scrollIntoView({ behavior: 'smooth' });
}

function gameCard(game) {
  const favorite = favorites.includes(game.id);
  return `<article class="game-card ${catalogView === 'list' ? 'list-mode' : ''}">
    <div class="game-image-wrap">
      <img class="game-image" src="${escapeAttr(game.image)}" alt="${escapeAttr(game.title)}" loading="lazy" onerror="handleBrokenGameImage(${game.id}, this)">
      <button class="favorite-btn ${favorite ? 'active' : ''}" onclick="toggleFavorite(${game.id})" aria-label="Favorito"><i class="fa-${favorite ? 'solid' : 'regular'} fa-heart"></i></button>
      <span class="platform-badge">${escapeHTML(game.platform)}</span>
    </div>
    <div class="game-card-body">
      <span class="genre">${escapeHTML(game.category)}</span>
      <h3 class="game-title">${escapeHTML(game.title)}</h3>
      <div class="rating">${stars(game.rating)} <span>${Number(game.rating).toFixed(1)}</span></div>
      <p class="game-desc">${escapeHTML(game.description)}</p>
      <div class="card-bottom">
        <div class="d-flex justify-content-between align-items-end mb-3">
          <div><span class="stock ${game.stock === 0 ? 'out' : game.stock <= 5 ? 'low' : 'ok'}">${game.stock === 0 ? 'Agotado' : game.stock <= 5 ? `Solo ${game.stock} disponibles` : `${game.stock} disponibles`}</span><div class="price">${formatMoney(game.price)}</div></div>
          <button class="btn btn-sm btn-soft" onclick="openGameDetail(${game.id})">Detalles</button>
        </div>
        <button class="btn btn-primary w-100" ${game.stock === 0 ? 'disabled' : ''} onclick="addToCart(${game.id})"><i class="fa-solid fa-cart-plus me-2"></i>Agregar al carrito</button>
      </div>
    </div>
  </article>`;
}

function openGameDetail(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;
  const meta = [game.released ? `Lanzamiento ${String(game.released).slice(0, 4)}` : null, game.metacritic ? `Metacritic ${game.metacritic}` : null].filter(Boolean).join(' · ');
  document.getElementById('game-detail-content').innerHTML = `<div class="row g-0"><div class="col-md-5"><img class="game-detail-image" src="${escapeAttr(game.image)}" alt="${escapeAttr(game.title)}" onerror="handleBrokenGameImage(${game.id}, this)"></div><div class="col-md-7"><div class="detail-content"><button class="btn-close btn-close-white float-end" data-bs-dismiss="modal"></button><span class="section-kicker">${escapeHTML(game.category)} · ${escapeHTML(game.platform)}</span><h2 class="mt-2">${escapeHTML(game.title)}</h2><div class="rating my-3">${stars(game.rating)} <span>${game.rating.toFixed(1)}</span></div>${meta ? `<p class="detail-meta">${escapeHTML(meta)}</p>` : ''}<p class="text-secondary">${escapeHTML(game.description)}</p><div class="d-flex justify-content-between align-items-end my-4"><div><small class="text-secondary">Precio</small><div class="price">${formatMoney(game.price)}</div></div><span class="stock ${game.stock === 0 ? 'out' : game.stock <= 5 ? 'low' : 'ok'}">${game.stock ? `${game.stock} disponibles` : 'Agotado'}</span></div><button class="btn btn-primary w-100" ${game.stock === 0 ? 'disabled' : ''} onclick="addToCart(${game.id});modals.detail.hide()"><i class="fa-solid fa-cart-plus me-2"></i>Agregar al carrito</button></div></div></div>`;
  modals.detail.show();
}

function showView(name) {
  if (name === 'admin' && currentUser?.role !== 'admin') return;
  if (['library', 'profile'].includes(name) && !currentUser) {
    modals.login.show();
    return;
  }
  document.querySelectorAll('.app-view').forEach(view => view.classList.add('d-none'));
  document.getElementById(`view-${name}`).classList.remove('d-none');
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
  document.getElementById(`nav-${name}`)?.classList.add('active');
  if (name === 'profile') renderProfile();
  if (name === 'admin') {
    renderAdminTables();
    renderAdminStats();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateUI() {
  const logged = !!currentUser;
  const admin = currentUser?.role === 'admin';
  document.getElementById('login-btn').classList.toggle('d-none', logged);
  document.getElementById('user-menu').classList.toggle('d-none', !logged);
  document.getElementById('nav-library').classList.toggle('d-none', !logged);
  document.getElementById('nav-admin').classList.toggle('d-none', !admin);
  if (logged) {
    document.getElementById('user-name-short').textContent = currentUser.name.split(' ')[0];
    document.getElementById('user-initial').textContent = currentUser.name.charAt(0).toUpperCase();
  }
  document.getElementById('favorites-count').textContent = favorites.length;
}

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateForm(form)) return;
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const user = users.find(u => u.email.toLowerCase() === email && u.password === password);
  if (!user) {
    showToast('No pudimos ingresar', 'Revisa correo y contraseña.', 'danger');
    return;
  }
  currentUser = user;
  persist();
  updateUI();
  modals.login.hide();
  form.reset();
  form.classList.remove('was-validated');
  renderAll();
  showToast('Bienvenido', `Hola, ${user.name.split(' ')[0]}.`, 'success');
}

function logout() {
  currentUser = null;
  persist();
  updateUI();
  showView('catalog');
  showToast('Sesión cerrada', 'Hasta pronto.', 'info');
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
  persist();
  document.getElementById('favorites-count').textContent = favorites.length;
  filterGames(false);
  renderFavorites();
}

function renderFavorites() {
  const element = document.getElementById('favorites-container');
  const data = games.filter(game => favorites.includes(game.id));
  element.innerHTML = data.length ? data.map(game => `<div class="col">${gameCard(game)}</div>`).join('') : emptyState('fa-heart', 'Aún no tienes favoritos', 'Marca el corazón de cualquier juego para guardarlo aquí.');
}

function renderLibrary() {
  const element = document.getElementById('library-container');
  if (!currentUser) {
    element.innerHTML = '';
    return;
  }
  const ids = new Set(orders.filter(order => order.userId === currentUser.id).flatMap(order => order.items.map(item => item.id)));
  const data = games.filter(game => ids.has(game.id));
  element.innerHTML = data.length ? data.map(game => `<div class="col">${gameCard(game)}</div>`).join('') : emptyState('fa-layer-group', 'Tu biblioteca está vacía', 'Tus compras aparecerán aquí.');
}

function addToCart(id) {
  const game = games.find(g => g.id === id);
  if (!game || game.stock < 1) return;
  const item = cart.find(value => value.id === id);
  const quantity = item?.quantity || 0;
  if (quantity >= game.stock) {
    showToast('Stock máximo', `Solo quedan ${game.stock} unidades.`, 'warning');
    return;
  }
  item ? item.quantity++ : cart.push({ ...game, quantity: 1 });
  persist();
  updateCartUI();
  showToast('Agregado al carrito', game.title, 'success');
}

function updateCartUI() {
  const element = document.getElementById('cart-items-container');
  let subtotal = 0;
  let count = 0;
  const validItems = cart.filter(item => games.some(game => game.id === item.id));
  if (validItems.length !== cart.length) cart = validItems;

  element.innerHTML = cart.length ? cart.map(item => {
    const game = games.find(g => g.id === item.id);
    subtotal += game.price * item.quantity;
    count += item.quantity;
    return `<div class="cart-item"><img src="${escapeAttr(game.image)}" alt="${escapeAttr(game.title)}" onerror="handleBrokenGameImage(${game.id}, this)"><div><strong>${escapeHTML(game.title)}</strong><small class="d-block text-secondary">${formatMoney(game.price)} c/u</small></div><div><div class="qty-control"><button onclick="changeQuantity(${game.id},-1)">−</button><strong>${item.quantity}</strong><button onclick="changeQuantity(${game.id},1)">+</button><button class="ms-2 text-danger" onclick="removeFromCart(${game.id})"><i class="fa-solid fa-trash"></i></button></div></div></div>`;
  }).join('') : emptyState('fa-bag-shopping', 'Tu carrito está vacío', 'Agrega juegos para continuar.');

  const discount = coupon === 'LEVEL10' ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-subtotal').textContent = formatMoney(subtotal);
  document.getElementById('cart-discount').textContent = `-${formatMoney(discount)}`;
  document.getElementById('cart-total-price').textContent = formatMoney(total);
  document.getElementById('checkout-total').textContent = formatMoney(total);
}

function changeQuantity(id, delta) {
  const item = cart.find(value => value.id === id);
  const game = games.find(value => value.id === id);
  if (!item || !game) return;
  item.quantity += delta;
  if (item.quantity <= 0) return removeFromCart(id);
  if (item.quantity > game.stock) {
    item.quantity = game.stock;
    showToast('Stock máximo', `Solo quedan ${game.stock} unidades.`, 'warning');
  }
  persist();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  persist();
  updateCartUI();
}

function clearCart() {
  if (!cart.length) return;
  openConfirm('Vaciar carrito', '¿Quieres eliminar todos los productos?', () => {
    cart = [];
    coupon = null;
    persist();
    updateCartUI();
  });
}

function applyCoupon() {
  const code = document.getElementById('coupon-input').value.trim().toUpperCase();
  if (code === 'LEVEL10') {
    coupon = 'LEVEL10';
    showToast('Cupón aplicado', 'Obtienes 10% de descuento.', 'success');
  } else {
    coupon = null;
    showToast('Código no válido', 'Revisa el código ingresado.', 'warning');
  }
  updateCartUI();
}

function openCheckout() {
  if (!cart.length) {
    showToast('Carrito vacío', 'Agrega un producto para continuar.', 'warning');
    return;
  }
  if (!currentUser) {
    modals.cart.hide();
    modals.login.show();
    showToast('Ingresa a tu cuenta', 'Necesitas una sesión para comprar.', 'info');
    return;
  }
  modals.cart.hide();
  modals.checkout.show();
}

function checkoutCart(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateForm(form)) return;

  const holder = sanitizeText(document.getElementById('card-name').value);
  const digits = document.getElementById('card-number').value.replace(/\D/g, '');
  const expiry = document.getElementById('card-expiry').value;
  const cvv = document.getElementById('card-cvv').value;

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,70}$/.test(holder) || digits.length !== 16 || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || !/^\d{3}$/.test(cvv)) {
    showToast('Datos de pago inválidos', 'Revisa titular, tarjeta, vencimiento y CVV.', 'danger');
    return;
  }

  const [month, year] = expiry.split('/').map(Number);
  const now = new Date();
  const fullYear = 2000 + year;
  if (new Date(fullYear, month, 0) < new Date(now.getFullYear(), now.getMonth(), 1)) {
    showToast('Tarjeta vencida', 'Ingresa una fecha vigente.', 'danger');
    return;
  }

  for (const item of cart) {
    const game = games.find(g => g.id === item.id);
    if (!game || game.stock < item.quantity) {
      showToast('Stock actualizado', `${item.title} ya no tiene stock suficiente.`, 'warning');
      return;
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (games.find(game => game.id === item.id)?.price || 0) * item.quantity, 0);
  const discount = coupon === 'LEVEL10' ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  orders.push({ id: Date.now(), userId: currentUser.id, userName: currentUser.name, date: new Date().toISOString(), items: cart.map(item => ({ ...item })), total });
  cart.forEach(item => {
    const game = games.find(g => g.id === item.id);
    if (game) game.stock -= item.quantity;
  });
  cart = [];
  coupon = null;
  persist();
  renderAll();
  modals.checkout.hide();
  form.reset();
  form.classList.remove('was-validated');
  showToast('Compra confirmada', 'Tu compra fue registrada correctamente.', 'success');
}

function renderProfile() {
  if (!currentUser) return;
  document.getElementById('profile-name').value = currentUser.name;
  document.getElementById('profile-email').value = currentUser.email;
  renderOrders();
}

function saveProfile(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateForm(form)) return;
  const name = sanitizeText(document.getElementById('profile-name').value);
  const email = document.getElementById('profile-email').value.trim().toLowerCase();
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,60}$/.test(name)) {
    showToast('Nombre inválido', 'Usa solo letras y espacios.', 'danger');
    return;
  }
  if (!isValidEmail(email) || users.some(user => user.email.toLowerCase() === email && user.id !== currentUser.id)) {
    showToast('Correo inválido', 'El correo no es válido o ya está registrado.', 'danger');
    return;
  }
  const index = users.findIndex(user => user.id === currentUser.id);
  users[index] = { ...users[index], name, email };
  currentUser = { ...currentUser, name, email };
  persist();
  updateUI();
  showToast('Perfil actualizado', 'Tus cambios fueron guardados.', 'success');
}

function renderOrders() {
  const element = document.getElementById('orders-container');
  if (!element || !currentUser) return;
  const data = orders.filter(order => order.userId === currentUser.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  element.innerHTML = data.length ? data.map(order => `<div class="order-card"><div class="d-flex justify-content-between"><strong>Orden #${String(order.id).slice(-6)}</strong><strong>${formatMoney(order.total)}</strong></div><small class="text-secondary">${formatDate(order.date)} · ${order.items.reduce((sum, item) => sum + item.quantity, 0)} producto(s)</small></div>`).join('') : '<p class="text-secondary mb-0">Aún no tienes compras registradas.</p>';
}

function renderAdminStats() {
  if (currentUser?.role !== 'admin') return;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStock = games.filter(game => game.stock <= 5).length;
  const stats = [
    [games.length, 'Productos', 'fa-gamepad'],
    [categories.length, 'Categorías', 'fa-tags'],
    [users.length, 'Usuarios', 'fa-users'],
    [orders.length, 'Compras', 'fa-receipt'],
    [formatMoney(revenue), 'Ventas', 'fa-chart-line'],
    [lowStock, 'Stock bajo', 'fa-box-open']
  ];
  document.getElementById('admin-stats').innerHTML = stats.map(([value, label, icon]) => `<div class="col-6 col-lg-4 col-xl-2"><div class="admin-stat"><i class="fa-solid ${icon} text-info mb-2"></i><strong class="d-block">${value}</strong><small>${label}</small></div></div>`).join('');
}

function renderAdminTables() {
  const gamesBody = document.getElementById('admin-games-tbody');
  const categoriesBody = document.getElementById('admin-categories-tbody');
  const usersBody = document.getElementById('admin-users-tbody');
  const ordersBody = document.getElementById('admin-orders-tbody');
  if (!gamesBody) return;

  gamesBody.innerHTML = games.map(game => `<tr><td>#${game.id}</td><td><div class="table-game"><img src="${escapeAttr(game.image)}" alt="" onerror="handleBrokenGameImage(${game.id}, this)"><div><strong>${escapeHTML(game.title)}</strong><small class="d-block text-secondary">${escapeHTML(game.category)}</small></div></div></td><td>${escapeHTML(game.platform)}</td><td><span class="badge ${game.stock === 0 ? 'text-bg-danger' : game.stock <= 5 ? 'text-bg-warning' : 'text-bg-success'}">${game.stock}</span></td><td>${formatMoney(game.price)}</td><td class="text-end"><button class="btn btn-sm btn-outline-warning me-1" onclick="openGameModal(${game.id})"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteGame(${game.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('');

  if (categoriesBody) {
    categoriesBody.innerHTML = categories.map(category => {
      const count = games.filter(game => game.category === category).length;
      return `<tr><td><strong>${escapeHTML(category)}</strong></td><td>${count}</td><td class="text-end"><button class="btn btn-sm btn-outline-warning me-1" onclick="openCategoryModal('${escapeJs(category)}')"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${escapeJs(category)}')" ${count ? 'disabled title="No se puede eliminar una categoría en uso"' : ''}><i class="fa-solid fa-trash"></i></button></td></tr>`;
    }).join('');
  }

  usersBody.innerHTML = users.map(user => `<tr><td>#${user.id}</td><td>${escapeHTML(user.name)}</td><td>${escapeHTML(user.email)}</td><td><span class="badge ${user.role === 'admin' ? 'text-bg-warning' : 'text-bg-primary'}">${user.role === 'admin' ? 'Administrador' : 'Cliente'}</span></td><td class="text-end"><button class="btn btn-sm btn-outline-warning me-1" onclick="openUserModal(${user.id})"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" ${user.id === currentUser?.id ? 'disabled' : ''}><i class="fa-solid fa-trash"></i></button></td></tr>`).join('');

  ordersBody.innerHTML = orders.length ? orders.slice().reverse().map(order => `<tr><td>#${String(order.id).slice(-6)}</td><td>${escapeHTML(order.userName)}</td><td>${formatDate(order.date)}</td><td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td>${formatMoney(order.total)}</td></tr>`).join('') : '<tr><td colspan="5" class="text-center text-secondary py-4">No hay compras registradas.</td></tr>';
}

function openGameModal(id = null) {
  if (currentUser?.role !== 'admin') return;
  populateFilters();
  const form = document.getElementById('game-form');
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('game-id').value = '';
  document.getElementById('description-count').textContent = '0';
  document.getElementById('gameModalTitle').textContent = id ? 'Editar producto' : 'Nuevo producto';

  if (id) {
    const game = games.find(value => value.id === id);
    if (!game) return;
    for (const key of ['title', 'category', 'platform', 'price', 'stock', 'image', 'rating', 'description']) {
      document.getElementById(`game-${key}`).value = game[key];
    }
    document.getElementById('game-id').value = game.id;
    document.getElementById('description-count').textContent = game.description.length;
  }
  modals.game.show();
}

async function saveGame(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateForm(form)) return;

  const id = Number(document.getElementById('game-id').value) || null;
  const title = sanitizeText(document.getElementById('game-title').value);
  const category = document.getElementById('game-category').value;
  const platform = document.getElementById('game-platform').value;
  const price = Number(document.getElementById('game-price').value);
  const stock = Number(document.getElementById('game-stock').value);
  const image = document.getElementById('game-image').value.trim();
  const rating = Number(document.getElementById('game-rating').value);
  const description = sanitizeText(document.getElementById('game-description').value);

  if (!/^[\p{L}\p{N}][\p{L}\p{N}\s:'’&+.!?\-]{1,79}$/u.test(title)) {
    showToast('Título inválido', 'Revisa el título del producto.', 'danger');
    return;
  }
  if (!categories.includes(category)) {
    showToast('Categoría inválida', 'Selecciona una categoría existente.', 'danger');
    return;
  }
  if (!['PlayStation', 'Xbox', 'Nintendo Switch'].includes(platform)) {
    showToast('Plataforma inválida', 'Selecciona una plataforma válida.', 'danger');
    return;
  }
  if (games.some(game => game.title.toLowerCase() === title.toLowerCase() && game.platform === platform && game.id !== id)) {
    showToast('Producto duplicado', 'Ya existe ese juego para la misma plataforma.', 'danger');
    return;
  }
  if (!isHttpUrl(image)) {
    showToast('Imagen inválida', 'Ingresa una URL http o https.', 'danger');
    return;
  }
  if (!(await verifyImageUrl(image))) {
    showToast('Imagen no disponible', 'La URL ingresada no pudo cargarse como imagen.', 'danger');
    return;
  }
  if (!Number.isInteger(price) || price < 4990 || price > 120000 || price % 10 !== 0) {
    showToast('Precio inválido', 'Usa un precio entre $4.990 y $120.000.', 'danger');
    return;
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 999) {
    showToast('Stock inválido', 'El stock debe ser un entero entre 0 y 999.', 'danger');
    return;
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    showToast('Valoración inválida', 'La valoración debe estar entre 1 y 5.', 'danger');
    return;
  }
  if (description.length < 20 || description.length > 240) {
    showToast('Descripción inválida', 'La descripción debe tener entre 20 y 240 caracteres.', 'danger');
    return;
  }

  if (id) {
    const index = games.findIndex(game => game.id === id);
    games[index] = { ...games[index], title, category, platform, price, stock, image, rating, description };
  } else {
    games.push(new Game(Date.now(), title, category, price, image, description, platform, stock, rating, false, null, null, null, 'manual'));
  }

  persist();
  modals.game.hide();
  renderAll();
  showToast('Producto guardado', 'El catálogo fue actualizado.', 'success');
}

function deleteGame(id) {
  const game = games.find(value => value.id === id);
  if (!game) return;
  openConfirm('Eliminar producto', `¿Quieres eliminar “${game.title}”?`, () => {
    games = games.filter(value => value.id !== id);
    cart = cart.filter(value => value.id !== id);
    favorites = favorites.filter(value => value !== id);
    persist();
    renderAll();
    showToast('Producto eliminado', 'El catálogo fue actualizado.', 'info');
  });
}

function openCategoryModal(name = '') {
  if (currentUser?.role !== 'admin') return;
  const form = document.getElementById('category-form');
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('category-original-name').value = name;
  document.getElementById('category-name').value = name;
  document.getElementById('categoryModalTitle').textContent = name ? 'Editar categoría' : 'Nueva categoría';
  modals.category.show();
}

function saveCategory(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateForm(form)) return;

  const original = document.getElementById('category-original-name').value;
  const name = sanitizeText(document.getElementById('category-name').value);
  if (!/^[\p{L}\p{N}][\p{L}\p{N}\s&+\-/]{1,29}$/u.test(name)) {
    showToast('Categoría inválida', 'Usa entre 2 y 30 caracteres y evita símbolos especiales.', 'danger');
    return;
  }
  const duplicate = categories.some(category => category.toLowerCase() === name.toLowerCase() && category !== original);
  if (duplicate) {
    showToast('Categoría duplicada', 'Ya existe una categoría con ese nombre.', 'warning');
    return;
  }

  if (original) {
    const index = categories.indexOf(original);
    if (index < 0) return;
    categories[index] = name;
    games = games.map(game => game.category === original ? { ...game, category: name } : game);
  } else {
    categories.push(name);
  }

  categories = [...new Set(categories)].sort((a, b) => a.localeCompare(b, 'es'));
  persist();
  modals.category.hide();
  populateFilters();
  filterGames(true);
  renderAdminTables();
  renderAdminStats();
  showToast('Categoría guardada', 'Los filtros del catálogo fueron actualizados.', 'success');
}

function deleteCategory(name) {
  const count = games.filter(game => game.category === name).length;
  if (count) {
    showToast('Categoría en uso', `Hay ${count} producto(s) asociados. Reasígnalos antes de eliminarla.`, 'warning');
    return;
  }
  openConfirm('Eliminar categoría', `¿Quieres eliminar “${name}”?`, () => {
    categories = categories.filter(category => category !== name);
    persist();
    populateFilters();
    filterGames(true);
    renderAdminTables();
    renderAdminStats();
    showToast('Categoría eliminada', 'El filtro del catálogo fue actualizado.', 'info');
  });
}

function openUserModal(id = null) {
  if (currentUser?.role !== 'admin') return;
  const form = document.getElementById('user-form');
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('user-id').value = '';
  document.getElementById('userModalTitle').textContent = id ? 'Editar usuario' : 'Nuevo usuario';
  if (id) {
    const user = users.find(value => value.id === id);
    if (!user) return;
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-password').value = user.password;
    document.getElementById('user-role').value = user.role;
  }
  modals.user.show();
}

function saveUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!validateForm(form)) return;
  const id = Number(document.getElementById('user-id').value) || null;
  const name = sanitizeText(document.getElementById('user-name').value);
  const email = document.getElementById('user-email').value.trim().toLowerCase();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,60}$/.test(name)) {
    showToast('Nombre inválido', 'Usa solo letras y espacios.', 'danger');
    return;
  }
  if (!isValidEmail(email) || users.some(user => user.email.toLowerCase() === email && user.id !== id)) {
    showToast('Correo inválido', 'El correo no es válido o ya está registrado.', 'danger');
    return;
  }
  if (password.length < 6 || password.length > 40) {
    showToast('Contraseña inválida', 'Debe tener entre 6 y 40 caracteres.', 'danger');
    return;
  }
  if (!['usuario', 'admin'].includes(role)) {
    showToast('Rol inválido', 'Selecciona un rol válido.', 'danger');
    return;
  }

  if (id) {
    const index = users.findIndex(user => user.id === id);
    users[index] = new User(id, name, email, password, role);
    if (currentUser?.id === id) currentUser = { ...users[index] };
  } else {
    users.push(new User(Date.now(), name, email, password, role));
  }

  persist();
  updateUI();
  renderAdminTables();
  renderAdminStats();
  modals.user.hide();
  showToast('Usuario guardado', 'La cuenta fue actualizada.', 'success');
}

function deleteUser(id) {
  const user = users.find(value => value.id === id);
  if (!user || id === currentUser?.id) return;
  openConfirm('Eliminar usuario', `¿Quieres eliminar a ${user.name}?`, () => {
    users = users.filter(value => value.id !== id);
    persist();
    renderAdminTables();
    renderAdminStats();
    showToast('Usuario eliminado', 'La cuenta fue eliminada.', 'info');
  });
}

function validateForm(form) {
  form.classList.add('was-validated');
  return form.checkValidity();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function verifyImageUrl(url) {
  return new Promise(resolve => {
    const image = new Image();
    const timer = setTimeout(() => resolve(false), 6000);
    image.onload = () => { clearTimeout(timer); resolve(true); };
    image.onerror = () => { clearTimeout(timer); resolve(false); };
    image.src = url;
  });
}

function sanitizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function openConfirm(title, message, action) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-action-btn').onclick = () => {
    action();
    modals.confirm.hide();
  };
  modals.confirm.show();
}

function showToast(title, message, type = 'info') {
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-message').textContent = message;
  const toast = document.getElementById('appToast');
  toast.dataset.type = type;
  bootstrap.Toast.getOrCreateInstance(toast, { delay: 2800 }).show();
}

function stars(rating) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => `<i class="fa-${index < rounded ? 'solid' : 'regular'} fa-star"></i>`).join('');
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function emptyState(icon, title, text) {
  return `<div class="empty-state"><i class="fa-solid ${icon}"></i><h4>${escapeHTML(title)}</h4><p class="mb-0">${escapeHTML(text)}</p></div>`;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttr(value) {
  return escapeHTML(value);
}

function escapeJs(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}
