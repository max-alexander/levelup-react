# Especificación de Requisitos de Software (ERS) — v2

**Proyecto:** LEVEL/UP — Tienda online de videojuegos\
**Asignatura:** DSY1104 Desarrollo Fullstack II — Evaluación Parcial 2\
**Versión:** 2.0 (migración a React + pruebas unitarias)\
**Fecha:** noviembre 2026\
**Formato:** basado en IEEE 830

| Versión | Cambios principales |
|------|--------------------------------------------|
| 1.0 | Tienda en HTML, CSS, JavaScript y Bootstrap: catálogo desde la API de RAWG, carrito, favoritos, login y administración en ventanas modales. |
| 2.0 | Mejoras sobre la propuesta base: checkout por pasos, reseñas de clientes con moderación, buscador con sugerencias, filtro por precio, tema claro/oscuro y carga diferida del panel admin. Catálogo ampliado a 48 juegos (16 por plataforma) con portadas incluidas en el proyecto. Migración a React 18 (SPA con React Router), base de datos simulada en JS con CRUD, nuevas vistas (categorías, ofertas, checkout, pago exitoso/con error, blog, contacto, nosotros, registro) y panel de administración completo. Pruebas unitarias con Jasmine + Karma y reporte de cobertura. |

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requisitos funcionales y no funcionales del frontend de LEVEL/UP en su segunda versión. Está dirigido al equipo de desarrollo y al docente evaluador.

### 1.2 Alcance
LEVEL/UP es una tienda online de videojuegos para PlayStation, Xbox y Nintendo Switch. La versión 2 incluye:

- **Tienda pública:** catálogo con filtros, detalle de producto, categorías, ofertas, carrito, checkout con pasarela de pago simulada, registro e inicio de sesión, blog, contacto y nosotros.
- **Panel de administración:** dashboard, órdenes y boletas, productos (CRUD, stock crítico y reportes), categorías, usuarios (CRUD e historial de compras), reportes de ventas y perfil.

El backend es simulado por un módulo JavaScript (`src/data/db.js`) que persiste en `localStorage`. El catálogo inicial tiene 48 juegos con sus portadas guardadas en `public/assets/games/`, por lo que la tienda funciona sin conexión a internet. La integración con microservicios reales queda fuera del alcance de esta entrega.

### 1.3 Definiciones

| Término | Definición |
|---|---|
| SPA | *Single Page Application*: aplicación que se carga una sola vez y cambia de vista sin recargar la página. |
| Componente | Unidad reutilizable de interfaz en React, con props (entradas) y estado (datos internos). |
| Props | Datos y funciones que un componente recibe de su componente padre. |
| Estado (state) | Datos internos de un componente que, al cambiar, provocan un nuevo renderizado. |
| Context | Mecanismo de React para compartir estado global (sesión, carrito) sin pasar props por cada nivel. |
| CRUD | Crear, Leer, Actualizar y Eliminar. |
| Mock / Spy | Objeto o función falsa que reemplaza una dependencia real durante una prueba. |
| Stock crítico | Producto con 5 unidades o menos. |

### 1.4 Referencias
- DSY1104 Evaluación Parcial 2 — Instrucciones y Anexo 1.
- ERS v1 (entrega 1), versión HTML en la carpeta `legacy-v1/`.
- Documentación de React 18, React Router 6, Bootstrap 5.3, Jasmine 5 y Karma 6.

---

## 2. Descripción general

### 2.1 Perspectiva del producto
Es una SPA construida con Vite. React Router controla la navegación, los Context API manejan el estado global y la capa de datos expone servicios con operaciones CRUD. La interfaz se suscribe a los cambios de datos, así que cualquier modificación (por ejemplo, un admin que edita el stock) se refleja de inmediato en todas las vistas abiertas.

```
Componentes (pages / components)
        │ props y callbacks
        ▼
Context (Auth, Cart, Favorites, Toast) ── hooks (useCollection, useForm)
        │
        ▼
Servicios (authService, orderService, rawgService)
        │
        ▼
db.js (colecciones CRUD) ──► localStorage          rawgService ──► API RAWG (portadas)
```

### 2.2 Usuarios

| Perfil | Descripción | Acceso |
|---|---|---|
| Visitante | Navega sin sesión. | Tienda completa; puede comprar como invitado. |
| Cliente | Usuario registrado (rol `usuario`). | Lo del visitante, más Mi cuenta (perfil e historial) y autocompletado en el checkout. |
| Administrador | Rol `admin`. | Lo del cliente, más el panel `/admin`. |

### 2.3 Restricciones
- Frontend en React 18 con Bootstrap 5.3 para el diseño responsivo.
- Pruebas unitarias con Jasmine como framework y Karma como runner (Chrome Headless).
- Datos simulados en un archivo JS con CRUD y persistencia en `localStorage`.
- Montos en pesos chilenos (CLP), sin decimales.

### 2.4 Supuestos
- El navegador permite `localStorage`.
- La API de RAWG es opcional: si falla, se muestran placeholders y la tienda sigue funcionando.

---

## 3. Requisitos funcionales

### 3.1 Tienda

| ID | Requisito | Prioridad | Vista / componente |
|------|--------------------------------------|----------|--------------|
| RF-01 | Mostrar en el Home un hero con video, las categorías con su conteo de juegos, los productos destacados y las entradas del blog. | Alta | `Home` |
| RF-02 | Listar el catálogo con búsqueda por texto, filtros por plataforma y categoría, orden (destacados, valoración, precio, nombre), paginación de 9 por página y vista en cuadrícula o lista. | Alta | `Catalog`, `CatalogFilters`, `Pagination` |
| RF-03 | Buscar desde el navbar y redirigir al catálogo con el término aplicado (`/productos?q=`). | Media | `Navbar` |
| RF-04 | Mostrar el detalle de producto con precio, oferta, stock, selector de cantidad, favoritos y juegos relacionados. | Alta | `GameDetail` |
| RF-05 | Listar las categorías y ver los productos de cada una (`/categorias/:nombre`). | Alta | `Categories`, `CategoryCard` |
| RF-06 | Listar los productos en oferta, mostrando el precio original tachado y el porcentaje de descuento. | Alta | `Offers`, `PriceTag` |
| RF-07 | Agregar productos al carrito sin superar el stock disponible. | Alta | `CartContext` (reducer) |
| RF-08 | En el carrito, modificar cantidades, eliminar productos, vaciar el carrito (con confirmación), aplicar el cupón `LEVEL10` y ver subtotal, descuento y total. | Alta | `Cart`, `ConfirmModal` |
| RF-09 | El checkout es un asistente de 3 pasos (Datos → Envío → Pago) con indicador de progreso. Cada paso valida solo sus campos antes de avanzar; se puede volver atrás o saltar a un paso ya completado sin perder lo escrito; el paso de pago muestra un resumen editable de los datos, y el resumen del pedido queda siempre visible. | Alta | `Checkout`, `Stepper`, `AddressFields` |
| RF-10 | Si hay sesión iniciada, el checkout se autocompleta con los datos del cliente. | Media | `Checkout` |
| RF-11 | Pago aprobado: registrar la orden, descontar stock, vaciar el carrito y mostrar la vista "Se ha realizado la compra" con el resumen, un botón para imprimir la boleta (PDF) y otro para enviarla por email (simulado). | Alta | `PaymentResult` |
| RF-12 | Pago rechazado: registrar la orden como rechazada, mantener el carrito y el stock, y mostrar "No se pudo realizar el pago" con un botón para reintentar que conserva los datos ingresados. | Alta | `PaymentResult`, `orderService` |
| RF-13 | Registro de usuario con nombre, apellidos, correo único, contraseña con confirmación, región/comuna y aceptación de términos. | Alta | `Register` |
| RF-14 | Inicio de sesión que redirige según el rol (admin → `/admin`) o a la ruta solicitada antes del login. | Alta | `Login`, `ProtectedRoute` |
| RF-15 | Cerrar sesión desde el menú de usuario. | Media | `Navbar` |
| RF-16 | Mi cuenta: editar perfil y dirección, y ver el historial de compras con su estado. | Media | `Account`, `OrderHistory` |
| RF-17 | Favoritos: marcar y desmarcar juegos y verlos en una vista propia. | Baja | `FavoritesContext`, `Favorites` |
| RF-18 | Blog con listado y dos artículos de detalle. | Media | `BlogList`, `BlogDetail` |
| RF-19 | Formulario de contacto validado con mensaje de confirmación. | Media | `Contact` |
| RF-20 | Página Nosotros con misión y visión, y página 404 para rutas inexistentes. | Baja | `About`, `NotFound` |
| RF-35 | Reseñas de clientes en el detalle del producto: promedio, cantidad y distribución por estrellas, que se actualizan en vivo. Un usuario con sesión publica una reseña (1 a 5 estrellas y un comentario de 10 a 300 caracteres) y solo una por juego; sin sesión se lo invita a ingresar. | Alta | `ProductReviews`, `ReviewForm`, `StarRatingInput` |
| RF-36 | Buscador con sugerencias en vivo desde 2 caracteres (portada, plataforma y precio), navegable con flechas, Enter y Esc, y con la opción "Ver todos los resultados". | Media | `SearchBox` |
| RF-37 | Filtro del catálogo por rango de precio, calculado sobre el precio con descuento. | Media | `CatalogFilters` |
| RF-38 | Tema claro u oscuro a elección del usuario, guardado entre visitas. | Baja | `ThemeContext`, `ThemeToggle` |

### 3.2 Administración

| ID | Requisito | Prioridad | Vista / componente |
|------|--------------------------------------|----------|--------------|
| RF-21 | Proteger `/admin/*`: sin sesión se redirige a login y un cliente se redirige al Home. | Alta | `ProtectedRoute` |
| RF-22 | Dashboard con compras, productos/inventario, usuarios y accesos a cada módulo. | Alta | `Dashboard` |
| RF-23 | Sincronizar desde la API de RAWG las portadas de los productos sin imagen (por ejemplo, los creados por el admin), informando cuántas se actualizaron y cuántas fallaron. | Media | `Dashboard`, `rawgService` |
| RF-24 | Órdenes: listar con filtro por estado y mostrar la boleta con opción de imprimir. | Alta | `OrderList`, `OrderDetail` |
| RF-25 | Productos: listar con búsqueda, crear, ver, editar y eliminar (con confirmación). Se validan título, categoría existente, plataforma, precio, stock, descuento, valoración, URL de imagen y descripción, y se impiden juegos duplicados en una misma plataforma. | Alta | `ProductList`, `ProductForm`, `ProductView` |
| RF-26 | Listado de productos críticos (stock ≤ 5). | Media | `CriticalProducts` |
| RF-27 | Reporte de productos: unidades vendidas y valor del stock. | Media | `ProductReports` |
| RF-28 | Categorías: crear, editar (al renombrar se actualizan sus productos) y eliminar solo si no tienen productos. | Alta | `CategoryList`, `CategoryForm` |
| RF-29 | Usuarios: listar, crear, ver, editar y eliminar (el admin no puede eliminarse a sí mismo) y ver el historial de compras con enlace a cada boleta. | Alta | `UserList`, `UserForm`, `UserView` |
| RF-30 | Reportes de ventas: total vendido, órdenes pagadas y rechazadas, ticket promedio, y ventas por plataforma, categoría y mes. | Media | `Reports` |
| RF-31 | Perfil del administrador. | Baja | `Account admin` |
| RF-39 | Moderación de reseñas: listar, filtrar por calificación y eliminar con confirmación. | Media | `ReviewModeration` |

### 3.3 Datos (archivo JS como base de datos)

| ID | Requisito |
|------|------------------------------------------------------|
| RF-32 | `db.js` expone las colecciones `games`, `categories`, `users`, `orders` y `reviews`, cada una con `getAll`, `getById`, `find`, `create`, `update`, `remove`, `replaceAll` y `reset`. |
| RF-33 | Cada escritura persiste en `localStorage` y notifica a los suscriptores; el hook `useCollection` vuelve a renderizar los componentes en tiempo real. |
| RF-34 | Las lecturas devuelven copias para que la interfaz no pueda mutar los datos almacenados por accidente. |

**Modelo de datos (alineado con la entrega 1):**

```
Game     { id, title, category, platform, price, stock, rating, description, image, featured, discount, source }
Category { id, name, description, icon }
User     { id, name, lastName, email, password, role: 'admin'|'usuario',
           address: { street, apartment, region, comuna, notes } }
Order    { id, code, userId, status: 'pagada'|'rechazada', date, customer{name,lastName,email},
           address{...}, items[{id,title,price,quantity}], subtotal, couponDiscount, total,
           authorization, paymentMessage }
Review   { id, gameId, userId, userName, rating: 1..5, comment, date }
```

---

## 4. Requisitos no funcionales

| ID | Tipo | Requisito |
|-------|-----------|--------------------------------------------|
| RNF-01 | Usabilidad / responsividad | La interfaz se adapta a móvil (< 576 px), tablet (768–991 px) y escritorio (≥ 992 px) con la grilla de Bootstrap: navbar colapsable con menú hamburguesa, catálogo de 1 a 3 columnas, filtros apilados en móvil y sidebar del admin convertible en menú. |
| RNF-02 | Mantenibilidad | Componentes con responsabilidad única ("Single Responsibility"): presentacionales (`GameCard`, `GameList`) separados de los contenedores (`GameGrid`), y lógica pura (`cartReducer`, `validators`, `catalog`) aislada de la UI. |
| RNF-03 | Calidad | Pruebas unitarias con Jasmine + Karma, con un umbral de cobertura configurado en Karma (statements 70%, branches 55%, functions 65%, lines 70%). Ver el documento de cobertura. |
| RNF-04 | Accesibilidad | Labels asociados a cada input, `aria-invalid` y mensajes de error vinculados, `aria-label` en botones de ícono y navegación por teclado. |
| RNF-05 | Seguridad (frontend) | La sesión nunca guarda la contraseña; las rutas de admin se protegen por rol; React escapa el contenido (no se usa `dangerouslySetInnerHTML`); las URLs de imagen se validan como http(s). |
| RNF-06 | Rendimiento | El panel admin se carga bajo demanda con `React.lazy` + `Suspense` (archivo aparte de unos 9 kB gzip que el cliente de la tienda nunca descarga); build de la tienda de unos 82 kB gzip de JS; portadas optimizadas (JPG de 330 px, ~30 kB cada una) con `loading="lazy"`; filtros memorizados con `useMemo`. |
| RNF-07 | Robustez | Las portadas son locales y no dependen de servicios externos; si una imagen no carga o un producto no tiene portada, se muestra un placeholder por plataforma; si `localStorage` contiene un JSON corrupto, se usan los datos semilla. |

---

## 5. Herramientas y tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| React / React DOM | 18.3.1 | Componentes, estado y hooks |
| React Router DOM | 6.28.0 | Navegación SPA y rutas protegidas |
| Bootstrap | 5.3.3 | Grilla y componentes responsivos |
| Font Awesome | 6.6 (CDN) | Íconos |
| Vite | 5.4 | Servidor de desarrollo y build |
| Jasmine | 5.5 | Framework de pruebas (describe/it/expect, spies) |
| Karma | 6.4 | Runner de pruebas en Chrome Headless |
| karma-webpack + Babel | 5 / 7 | Transpilar JSX para las pruebas |
| babel-plugin-istanbul + karma-coverage | 7 / 2.2 | Medición de cobertura |
| @testing-library/react | 16.1 | Render y consultas del DOM en las pruebas |
| Git + GitHub | — | Control de versiones |

---

## 6. Flujo de navegación

```
TIENDA
├── Home ─────────────────────────────┐
├── Productos ── Detalle producto (reseñas) ── (carrito)
├── Categorías ── Categoría #n
├── Ofertas
├── Carrito ── Checkout 1·2·3 ──┬── Pago correcto (boleta)
│                               └── Pago con error ── Reintentar pago
├── Iniciar sesión ── Registro usuario
├── Nosotros · Blog ── Detalle blog #1 / #2 · Contacto
└── Mi cuenta / Favoritos

ADMINISTRADOR (/admin)
├── Dashboard
├── Órdenes ── Mostrar boleta
├── Productos ── Nuevo · Mostrar ── Editar · Críticos · Reportes
├── Categorías ── Nueva · Editar
├── Usuarios ── Nuevo · Mostrar ── Editar · Historial de compras
├── Reseñas (moderación)
├── Reportes
└── Perfil
```

---

## 7. Criterios de aceptación

1. `npm run dev` levanta la aplicación y todas las rutas de la sección 6 son navegables.
2. `npm test` ejecuta 135 pruebas sin fallos y la cobertura supera los umbrales configurados.
3. Una compra con la tarjeta de prueba rechazada lleva a la vista de error, y al reintentar con una tarjeta válida se completa la compra.
4. Los cambios del admin (stock, categorías, usuarios) se reflejan inmediatamente en la tienda.
5. La tienda se ve correctamente en móvil, tablet y escritorio (capturas en `docs/capturas/`).
