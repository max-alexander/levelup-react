// Punto de entrada de Karma: carga todas las specs (*.spec.js / *.spec.jsx) en un solo bundle.
import { cleanup } from '@testing-library/react';
import { resetDatabase } from '../data/db';

beforeEach(() => {
  localStorage.clear();
  resetDatabase();
});

afterEach(() => cleanup());

const context = import.meta.webpackContext('..', { recursive: true, regExp: /\.spec\.jsx?$/ });
context.keys().filter(key => !key.includes('test/index')).forEach(context);
