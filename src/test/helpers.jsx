// Utilidades compartidas por las pruebas.
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppProviders, AppRoutes, ROUTER_FUTURE } from '../App';
import { authService } from '../services/authService';

/** Muestra la ruta actual para verificar navegaciones. */
export function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

/** Renderiza la aplicación completa en una ruta, opcionalmente con sesión iniciada. */
export function renderApp(route = '/', { as } = {}) {
  if (as === 'admin') authService.login('admin@game.com', '123456');
  if (as === 'user') authService.login('user@game.com', '123456');
  return render(
    <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE}>
      <AppProviders>
        <AppRoutes />
        <LocationDisplay />
      </AppProviders>
    </MemoryRouter>
  );
}

/** Renderiza un componente suelto dentro de los providers y del router. */
export function renderWithProviders(ui, { route = '/', path = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE}>
      <AppProviders>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="*" element={<div />} />
        </Routes>
        <LocationDisplay />
      </AppProviders>
    </MemoryRouter>
  );
}

/** Escribe en un campo por su atributo name (simula al usuario tipeando). */
export function fill(container, name, value) {
  const field = container.querySelector(`[name="${name}"]`);
  if (!field) throw new Error(`No existe el campo ${name}`);
  fireEvent.change(field, { target: { value } });
  return field;
}

export const currentPath = screen => screen.getByTestId('location').textContent;
