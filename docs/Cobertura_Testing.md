# Documento de cobertura de testing

**Proyecto:** LEVEL/UP — Tienda online de videojuegos (frontend React)\
**Asignatura:** DSY1104 Desarrollo Fullstack II — Evaluación Parcial 2\
**Herramientas:** Jasmine 5.5 · Karma 6.4 · Chrome Headless · babel-plugin-istanbul + karma-coverage · @testing-library/react\
**Resultado:** **112 pruebas, 112 exitosas, 0 fallidas**, ejecutadas en unos 2 s

---

## 1. Objetivo y alcance

El objetivo es verificar la lógica y el comportamiento de los componentes del frontend React y de las capas que los sostienen: datos, servicios, contexto y utilidades. Se cubren las cinco categorías propuestas por el docente (renderizado, renderizado condicional, props, estado y eventos), más el uso de mocks y el análisis de cobertura.

**Dentro del alcance:** componentes reutilizables, páginas de la tienda y del panel admin, reducer del carrito, base de datos simulada (CRUD), servicios de autenticación, compra e integración con RAWG, validadores y utilidades.

**Fuera del alcance:** pruebas end-to-end en navegador real (Cypress o Playwright), pruebas visuales y de rendimiento, y `main.jsx` (solo monta la app).

---

## 2. Configuración del entorno de pruebas

| Archivo | Rol |
|---|---|
| `karma.conf.cjs` | Configura Karma: framework `jasmine`, navegador `ChromeHeadless`, bundle con `karma-webpack`, reporters `spec` (consola), `kjhtml` (HTML de Jasmine) y `coverage`, y umbrales mínimos de cobertura. |
| `src/test/index.spec.js` | Punto de entrada único: limpia `localStorage` y reinicia la BD antes de cada prueba (`beforeEach`), desmonta los componentes después (`afterEach(cleanup)`) y carga todos los `*.spec.js(x)` con `import.meta.webpackContext`. |
| `src/test/helpers.jsx` | `renderApp(ruta, { as })` renderiza la app completa en una ruta, con sesión de admin o de cliente si se pide; `fill()` simula escritura en un campo; `LocationDisplay` permite verificar la navegación. |

**Flujo de ejecución:**

```
npm test
  └─ Karma inicia ChromeHeadless
       └─ webpack + Babel (preset-react, preset-env) transpila JSX
            └─ babel-plugin-istanbul instrumenta el código fuente (no las specs)
                 └─ Jasmine ejecuta describe/it en orden fijo (random: false)
                      └─ karma-coverage genera coverage/html, coverage.txt y coverage-summary.json
```

**Umbrales configurados** (`coverageReporter.check.global`): statements 70%, branches 55%, functions 65%, lines 70%. Si la cobertura baja de estos valores, `npm test` falla.

**Aislamiento:** cada prueba parte de los datos semilla, porque `localStorage.clear()` y `resetDatabase()` se ejecutan en el `beforeEach` global. Los spies de Jasmine se restauran automáticamente al terminar cada `it`.

---

## 3. Estrategia: qué se prueba en cada capa

| Capa | Tipo de prueba | Archivo spec |
|---|---|---|
| Utilidades y validadores | Lógica pura (entrada → salida) | `utils/validators.spec.js`, `utils/catalog.spec.js` |
| Base de datos simulada | CRUD, persistencia y suscripción | `data/db.spec.js` |
| Estado del carrito | Reducer puro e inmutabilidad | `context/cartReducer.spec.js` |
| Servicios | Reglas de negocio con mocks | `services/*.spec.js` |
| Componentes comunes | Render, props, condicional y eventos | `components/common/common.spec.jsx` |
| Componentes de tienda | Render de listas, props y eventos | `components/store/store.spec.jsx` |
| Navegación | Rutas protegidas y navbar | `components/layout/navigation.spec.jsx` |
| Páginas de la tienda | Estado de formularios y flujos | `pages/store/auth.spec.jsx`, `shopping.spec.jsx`, `content.spec.jsx` |
| Panel admin | CRUD desde la UI y mocks de API | `pages/admin/admin.spec.jsx` |

---

## 4. Matriz: categorías del docente → pruebas que las cubren

### 4.1 Pruebas de renderizado
| Requisito | Prueba (describe › it) |
|--------------|------------------------------|
| Renderizado correcto con los datos dados | GameCard › *renderiza los datos del juego recibido por props* |
| **Tarea:** la lista renderiza todos los elementos | GameList › *renderiza una tarjeta por cada elemento del conjunto de datos* (48 de 48) |
| | Catálogo › *pagina los productos y permite cambiar de página* |
| | Vistas de contenido › *el blog lista todos los artículos y abre su detalle* |

### 4.2 Renderizado condicional
| Requisito | Prueba |
|--------------|------------------------------|
| **Tarea:** el mensaje de error solo aparece si hay error | AlertMessage › *no renderiza nada cuando no hay error* / *muestra el mensaje solo cuando hay un error* |
| | Login › *muestra el mensaje de error que devuelve el servicio* (antes del submit no hay alerta) |
| Otros | GameList › *muestra un estado vacío*; Pagination › *no se muestra con una sola página*; ConfirmModal › *se oculta con show=false*; GameImage › *usa placeholder si la imagen falla*; Navegación › *el admin ve el acceso al panel* |

### 4.3 Pruebas de props
| Requisito | Prueba |
|--------------|------------------------------|
| **Tarea:** el botón recibe la etiqueta y onClick | Button › *recibe la etiqueta y ejecuta la función onClick* / *aplica variante y no dispara onClick cuando está deshabilitado* |
| El componente usa sus props | GameCard › *muestra precio tachado y badge en oferta*, *deshabilita la compra sin stock*, *el botón de favorito refleja el estado*; GameList › *cambia a vista de lista según la prop layout*; FormField › *asocia label e input y muestra el error* |

### 4.4 Pruebas de estado (state)
| Requisito | Prueba |
|--------------|------------------------------|
| **Tarea:** el estado del formulario cambia al escribir | Login › *el estado del formulario cambia cuando el usuario escribe*; Login › *el error desaparece cuando se corrige el campo* |
| Estado derivado | Registro › *la lista de comunas depende de la región*; Checkout › *aplica máscaras a la tarjeta* |
| Estado global (reducer) | cartReducer: 6 pruebas (agregar, límite de stock, setQuantity, cupón, inmutabilidad, clear) |
| Estado persistido | Checkout › *autocompleta los datos si hay sesión*; Favoritos › *marcar un favorito lo muestra en la vista* |

### 4.5 Pruebas de eventos
| Requisito | Prueba |
|--------------|------------------------------|
| **Tarea:** un clic cambia el estado o ejecuta una función | GameCard › *al hacer clic en "Agregar al carrito" ejecuta onAddToCart*; Navegación › *el contador del carrito se actualiza al agregar un producto*; Carrito › *suma, resta, aplica cupón y recalcula el total* |
| Eventos de formularios | CatalogFilters › *emite los filtros actualizados al escribir y seleccionar*; Contacto › *valida y confirma el envío*; Admin › *crea / edita / elimina un producto* |
| Eventos de navegación | Navegación › *el buscador navega al catálogo*, *cerrar sesión*; Pago con error › *volver a realizar el pago* |

---

## 5. Uso de mocks

| Dependencia reemplazada | Técnica de Jasmine | Para qué |
|----------|--------------|--------------------|
| `paymentGateway.charge` (pasarela de pago) | `spyOn(...).and.returnValue({ approved })` y `.and.returnValues(...)` | Forzar un pago aprobado o rechazado y probar el reintento sin depender de la tarjeta. |
| `window.fetch` (API RAWG) | `spyOn(window, 'fetch').and.returnValue(Promise)` y `jasmine.createSpy().and.callFake(...)` | Simular respuestas OK, errores HTTP 500, red caída y resultados vacíos. |
| `rawgService.syncCovers` | `spyOn(...).and.returnValue(Promise.resolve/reject)` | Probar la notificación del Dashboard en los casos de éxito y de error. |
| `authService.login` / `currentUser` | `.and.throwError(...)`, `.and.returnValue(...)` | Probar el mensaje de error y la redirección por rol sin credenciales reales. |
| `db.games.create` | `spyOn(...).and.callThrough()` | Verificar los argumentos con que el formulario llama al CRUD. |
| `Storage.prototype.setItem` | `spyOn(...).and.callThrough()` | Comprobar que cada escritura persiste en `localStorage`. |
| Callbacks (onClick, onChange…) | `jasmine.createSpy()` | Verificar que el componente emite el evento con los argumentos correctos. |

Los servicios se exportan como **objetos** (`authService`, `paymentGateway`, `rawgService`) y no como funciones sueltas. Así `spyOn` puede reemplazar sus métodos: los exports de un módulo ES no se pueden redefinir, pero las propiedades de un objeto sí.

---

## 6. Resultados

### 6.1 Ejecución
```
Chrome Headless 156.0.0.0 (Windows 10): Executed 112 of 112 SUCCESS (2.0 secs)
TOTAL: 112 SUCCESS
```
El log completo está en `docs/evidencias/karma-run.txt`.

### 6.2 Cobertura global

| Métrica | Cubierto | Total | % | Umbral |
|---|---|---|---|---|
| Statements | 944 | 1043 | **90,50%** | 70% ✔ |
| Branches | 618 | 749 | **82,51%** | 55% ✔ |
| Functions | 356 | 413 | **86,19%** | 65% ✔ |
| Lines | 797 | 863 | **92,35%** | 70% ✔ |

### 6.3 Cobertura por módulo (statements / branches / lines)

| Módulo | Stmts | Branch | Lines | Comentario |
|---|---|---|---|---|
| `src/hooks` | 100% | 100% | 100% | `useCollection` y `useForm`, cubiertos de forma indirecta por las páginas. |
| `src/services` | 98,9% | 93,4% | 100% | Reglas de compra, auth y RAWG, todas con mocks. |
| `src/data` | 98,6% | 94,1% | 98,2% | CRUD completo, suscripción y JSON corrupto. |
| `src/components/common` | 96,8% | 92,9% | 96,0% | Componentes reutilizables. |
| `src/utils` | 98,2% | 84,9% | 98,0% | Validadores y catálogo. |
| `src/context` | 93,4% | 79,6% | 97,5% | Reducer y providers. |
| `src/components/layout` | 91,7% | 80,0% | 93,5% | Navbar y layout. |
| `src/pages/store` | 90,7% | 77,6% | 90,9% | Flujos de compra, auth y contenido. |
| `src/components/store` | 85,1% | 80,3% | 85,4% | — |
| `src/pages/admin` | 80,9% | 72,3% | 85,4% | CRUD admin. |
| `src/components/admin` | 57,1% | 75,0% | 70,0% | Menú móvil del sidebar y botón de logout sin pruebas. |

El detalle por archivo está en `docs/evidencias/coverage.txt`; el reporte HTML navegable se genera en `coverage/html/index.html`.

---

## 7. Análisis de resultados

**Fortalezas**

- La lógica de negocio crítica (precios con oferta, cupón, stock, pago aprobado/rechazado/reintento y CRUD) supera el 95% de cobertura.
- Los flujos completos de usuario (registro → login → carrito → checkout → pago) se prueban integrados con el router y los Context reales. Solo se reemplazan las dependencias externas.
- Cada prueba es independiente: parte de los datos semilla y no depende del orden de ejecución.

**Brechas identificadas y justificación**

| Archivo | Líneas sin cubrir | Motivo / acción propuesta |
|----------|------------|------------------------------|
| `AdminLayout.jsx` (57%) | Toggle del menú móvil y logout del sidebar | Comportamiento visual en móvil. Propuesta: agregar una prueba de clic en el toggle y en "Cerrar sesión". |
| `GameGrid.jsx` (59%) | Aviso de "Stock máximo" desde la tarjeta | El límite de stock está probado en el reducer y en el detalle, pero no el toast desde el grid. |
| `Products.jsx` (61%) | `ProductReports` y la ficha de un producto inexistente | Vistas de solo lectura. Propuesta: prueba de render del reporte. |
| `Users.jsx` / `Categories.jsx` admin (74–77%) | Ramas de error (correo o nombre duplicado) | Propuesta: pruebas de validación de duplicados. |
| `PaymentResult.jsx` (70%) | Botones imprimir y enviar boleta | Usan `window.print` y un toast; se pueden cubrir con `spyOn(window, 'print')`. |

**Hallazgo 1, un bug que las pruebas sí detectaron:** al ampliar el catálogo a 48 juegos con portadas incluidas en el proyecto (`/assets/games/{id}.jpg`), la prueba *"edita un producto existente"* falló. El validador de imagen del formulario solo aceptaba URLs `http(s)`, así que **ningún producto existente se podía editar**. Se agregó `isLocalAsset()` al validador y una prueba de regresión. Este caso muestra el valor de tener pruebas de los flujos completos.

**Hallazgo 2, un bug que las pruebas no detectaron:** al activar los *future flags* de React Router se olvidó importar `ROUTER_FUTURE` en `main.jsx`. Las 111 pruebas seguían pasando porque `main.jsx` no se prueba (solo monta la app), pero el build quedaba en blanco. Se detectó al revisar la app en Chrome y se corrigió. Conclusión: las pruebas unitarias no reemplazan una verificación manual o *smoke test* del build. Como mejora se propone una prueba de humo que monte `main.jsx`.

**Conclusión:** la cobertura supera holgadamente los umbrales definidos (90% de statements frente al 70% exigido). Las brechas restantes están en elementos visuales secundarios del panel admin, no en la lógica de negocio.

---

## 8. Cómo reproducir

```bash
npm install
npm test             # ejecuta una vez, muestra el resumen y genera coverage/
npm run test:watch   # modo observación; abrir http://localhost:9876 para ver el reporte de Jasmine
```
