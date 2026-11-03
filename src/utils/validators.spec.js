import {
  isValidEmail, isHttpUrl, validateEmail, validateName, validatePassword, validateExpiry,
  runValidators, registerRules, productRules, cardRules
} from './validators';

describe('Validadores (lógica de formularios)', () => {
  it('acepta correos válidos y rechaza inválidos', () => {
    expect(isValidEmail('user@game.com')).toBeTrue();
    expect(isValidEmail('  admin@levelup.cl ')).toBeTrue();
    expect(isValidEmail('user@game')).toBeFalse();
    expect(isValidEmail('sin-arroba.com')).toBeFalse();
    expect(validateEmail('')).toBe('El correo es obligatorio.');
  });

  it('valida nombres solo con letras (2 a 50)', () => {
    expect(validateName('María José')).toBe('');
    expect(validateName('A')).toContain('entre 2 y 50');
    expect(validateName('R2D2')).toContain('entre 2 y 50');
    expect(validateName('', 'El apellido')).toBe('El apellido es obligatorio.');
  });

  it('exige contraseñas de 6 a 40 caracteres', () => {
    expect(validatePassword('123456')).toBe('');
    expect(validatePassword('123')).toContain('entre 6 y 40');
    expect(validatePassword('')).toBe('La contraseña es obligatoria.');
  });

  it('detecta tarjetas vencidas comparando con la fecha actual', () => {
    const today = new Date(2026, 10, 2); // noviembre 2026
    expect(validateExpiry('11/26', today)).toBe('');
    expect(validateExpiry('10/26', today)).toBe('La tarjeta está vencida.');
    expect(validateExpiry('13/30', today)).toBe('Usa el formato MM/AA.');
  });

  it('runValidators devuelve solo los campos con error (registro)', () => {
    const errors = runValidators({
      name: 'Ana', lastName: 'Pérez', email: 'ana@mail.cl', password: '123456', confirmPassword: '654321',
      region: 'Región Metropolitana', comuna: 'Viña del Mar', terms: false
    }, registerRules);
    expect(Object.keys(errors).sort()).toEqual(['comuna', 'confirmPassword', 'terms']);
  });

  it('valida productos: rango de precio, stock y categoría existente', () => {
    const rules = productRules(['Acción']);
    const errors = runValidators({ title: 'X', category: 'Terror', platform: 'Sega', price: '500', stock: '-1', discount: '95', rating: '6', image: 'ftp://x', description: 'corta' }, rules);
    expect(Object.keys(errors).length).toBe(9);
    expect(runValidators({ title: 'Nuevo juego', category: 'Acción', platform: 'Xbox', price: '19990', stock: '0', discount: '0', rating: '4.5', image: '', description: 'Una descripción con más de veinte caracteres.' }, rules)).toEqual({});
  });

  it('valida datos de tarjeta y URLs', () => {
    expect(cardRules.cardNumber('4111 1111 1111 1111')).toBe('');
    expect(cardRules.cardNumber('4111')).not.toBe('');
    expect(cardRules.cardCvv('12a')).not.toBe('');
    expect(isHttpUrl('https://media.rawg.io/a.jpg')).toBeTrue();
    expect(isHttpUrl('javascript:alert(1)')).toBeFalse();
  });
});
