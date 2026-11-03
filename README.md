# LEVEL/UP — Tienda de videojuegos (React)

Entrega 2 de **DSY1104 Desarrollo Fullstack II**. Migración de la tienda LEVEL/UP (HTML + JS + Bootstrap, entrega 1) a una SPA en **React 18**, con **Bootstrap 5** responsivo, base de datos simulada en JavaScript con CRUD y persistencia en `localStorage`, y pruebas unitarias con **Jasmine + Karma**.

## Mejoras sobre la propuesta base

- **Checkout por pasos** (Datos → Envío → Pago) con validación por paso y resumen del pedido siempre visible.
- **Reseñas de clientes** con estrellas interactivas, promedio en vivo y moderación en el admin.
- **Buscador con sugerencias** (portada, precio, teclado) y **filtro por rango de precio**.
- **Tema claro/oscuro** guardado entre visitas y **panel admin cargado bajo demanda** (`React.lazy`).

## Requisitos

- Node.js 18 o superior (probado con Node 24)
- Google Chrome (Karma ejecuta las pruebas en ChromeHeadless)

## Cómo ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Jasmine + Karma (una ejecución) + reporte de cobertura
npm run test:watch # Karma en modo observación (abre el reporte HTML de Jasmine)
npm run build      # build de producción en dist/
```

El reporte de cobertura queda en `coverage/html/index.html`.

### Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@game.com | 123456 |
| Cliente | user@game.com | 123456 |

- Cupón de descuento: `LEVEL10` (10% extra).
- Pasarela de pago simulada: cualquier tarjeta válida de 16 dígitos se aprueba; la tarjeta **4000 0000 0000 0002** siempre se rechaza, para probar la vista de pago con error.
- El catálogo trae **48 juegos** (16 por plataforma) con portadas incluidas en `public/assets/games/`, así que no necesita internet.
- Panel admin → **Sincronizar portadas (RAWG)**: busca en la API de RAWG la portada de los productos nuevos creados sin imagen. Mientras tanto se muestra un placeholder por plataforma.

## Estructura

```
src/
├── data/          seed.js (datos iniciales), db.js (BD simulada con CRUD + localStorage), regiones.js
├── services/      authService, orderService (checkout + pasarela simulada), rawgService (API externa)
├── context/       AuthContext, CartContext (useReducer), FavoritesContext, ToastContext
├── hooks/         useCollection (suscripción en tiempo real a la BD), useForm (estado + validación)
├── utils/         validators, catalog (filtros/orden/paginación), format
├── components/
│   ├── common/    Button, AlertMessage, FormField, Pagination, ConfirmModal, ProtectedRoute, ...
│   ├── store/     GameCard, GameGrid, CatalogFilters, CategoryCard, AddressFields, OrderSummary, ...
│   ├── layout/    Navbar, Footer, StoreLayout
│   └── admin/     AdminLayout (sidebar)
├── pages/
│   ├── store/     Home, Catalog, GameDetail, Categories, Offers, Cart, Checkout, PaymentResult,
│   │              Login, Register, About, Blogs, Contact, Account, Favorites, NotFound
│   └── admin/     Dashboard, Orders (+boleta), Products (+críticos, reportes), ProductForm,
│                  Categories, Users (+historial), Reports
├── test/          index.spec.js (entrada de Karma), helpers.jsx
└── **/*.spec.js(x) pruebas junto al código que verifican
legacy-v1/         versión HTML/JS original (entrega 1) como referencia de la migración
docs/              ERS v2, documento de cobertura de testing, capturas y evidencias
```

## Mapa de rutas

**Tienda (pública):** `/`, `/productos`, `/productos/:id`, `/categorias`, `/categorias/:nombre`, `/ofertas`, `/carrito`, `/checkout`, `/compra/exitosa/:id`, `/compra/error/:id`, `/login`, `/registro`, `/nosotros`, `/blogs`, `/blogs/:slug`, `/contacto`, `/favoritos`, `/mi-cuenta` (requiere sesión).

**Administrador (rol admin):** `/admin`, `/admin/ordenes`, `/admin/ordenes/:id` (boleta), `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/:id`, `/admin/productos/:id/editar`, `/admin/productos/criticos`, `/admin/productos/reportes`, `/admin/categorias`, `/admin/categorias/nueva`, `/admin/categorias/:id/editar`, `/admin/usuarios`, `/admin/usuarios/nuevo`, `/admin/usuarios/:id`, `/admin/usuarios/:id/editar`, `/admin/usuarios/:id/historial`, `/admin/resenas`, `/admin/reportes`, `/admin/perfil`.

## Documentación

- ERS v2: [Markdown](docs/ERS_v2.md) · [Word](docs/ERS_v2.docx)
- Documento de cobertura de testing: [Markdown](docs/Cobertura_Testing.md) · [Word](docs/Cobertura_Testing.docx)
- Presentación: [PDF](docs/presentacion/LEVELUP_Entrega2_Presentacion.pdf) · [PowerPoint con notas de orador](docs/presentacion/LEVELUP_Entrega2_Presentacion.pptx)
