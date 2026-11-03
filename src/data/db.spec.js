import { createCollection, db, subscribe, storage } from './db';
import { SEED_GAMES } from './seed';

describe('Base de datos simulada (CRUD + persistencia)', () => {
  let items;
  beforeEach(() => {
    items = createCollection('test_items', [{ id: 1, name: 'Uno' }, { id: 2, name: 'Dos' }]);
    items.reset();
  });

  it('lee los datos semilla cuando localStorage está vacío', () => {
    expect(items.getAll().length).toBe(2);
    expect(db.games.getAll().length).toBe(SEED_GAMES.length);
    expect(items.getById(2).name).toBe('Dos');
    expect(items.getById(99)).toBeNull();
  });

  it('crea registros con id autoincremental y persiste en localStorage', () => {
    const setItem = spyOn(Storage.prototype, 'setItem').and.callThrough();
    const created = items.create({ name: 'Tres' });
    expect(created.id).toBe(3);
    expect(setItem).toHaveBeenCalledWith(items.key, jasmine.any(String));
    expect(JSON.parse(localStorage.getItem(items.key)).length).toBe(3);
  });

  it('impide ids duplicados', () => {
    expect(() => items.create({ id: 1, name: 'Duplicado' })).toThrowError(/Ya existe/);
  });

  it('actualiza sin cambiar el id y falla si no existe', () => {
    const updated = items.update(1, { name: 'Uno editado', id: 500 });
    expect(updated).toEqual({ id: 1, name: 'Uno editado' });
    expect(() => items.update(404, { name: 'x' })).toThrowError(/No existe/);
  });

  it('elimina registros y devuelve false si no existe', () => {
    expect(items.remove(1)).toBeTrue();
    expect(items.remove(1)).toBeFalse();
    expect(items.getAll().map(i => i.id)).toEqual([2]);
  });

  it('devuelve copias: mutar el resultado no altera el almacenamiento', () => {
    const all = items.getAll();
    all[0].name = 'Mutado';
    expect(items.getById(1).name).toBe('Uno');
  });

  it('notifica a los suscriptores en cada cambio (actualización en tiempo real)', () => {
    const listener = jasmine.createSpy('listener');
    const unsubscribe = subscribe(listener);
    items.create({ name: 'Nuevo' });
    expect(listener).toHaveBeenCalledWith('test_items');
    unsubscribe();
    items.create({ name: 'Otro' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('usa el valor por defecto si localStorage tiene JSON corrupto', () => {
    localStorage.setItem('corrupto', '{no-json');
    expect(storage.read('corrupto', 'fallback')).toBe('fallback');
  });
});
