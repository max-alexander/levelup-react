// Reglas de validación reutilizadas por todos los formularios.
// Cada validador devuelve un mensaje de error o '' si el valor es válido.
import { PLATFORMS } from '../data/seed';
import { REGIONES } from '../data/regiones';

const NAME_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{2,50}$/;

export const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? '').trim());

export const isHttpUrl = value => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export function required(value, label = 'Este campo') {
  return String(value ?? '').trim() ? '' : `${label} es obligatorio.`;
}

export function validateName(value, label = 'El nombre') {
  if (required(value)) return `${label} es obligatorio.`;
  return NAME_RE.test(String(value).trim()) ? '' : `${label} debe tener entre 2 y 50 letras.`;
}

export function validateEmail(value) {
  if (required(value)) return 'El correo es obligatorio.';
  return isValidEmail(value) ? '' : 'Ingresa un correo válido.';
}

export function validatePassword(value) {
  const v = String(value ?? '');
  if (!v) return 'La contraseña es obligatoria.';
  if (v.length < 6 || v.length > 40) return 'La contraseña debe tener entre 6 y 40 caracteres.';
  return '';
}

/** Ejecuta un mapa { campo: fn(valor, valores) } y devuelve solo los errores presentes. */
export function runValidators(values, rules) {
  return Object.entries(rules).reduce((errors, [field, rule]) => {
    const message = rule(values[field], values);
    if (message) errors[field] = message;
    return errors;
  }, {});
}

export const registerRules = {
  name: v => validateName(v),
  lastName: v => validateName(v, 'El apellido'),
  email: validateEmail,
  password: validatePassword,
  confirmPassword: (v, all) => (v === all.password ? '' : 'Las contraseñas no coinciden.'),
  region: v => required(v, 'La región'),
  comuna: (v, all) => (REGIONES[all.region]?.includes(v) ? '' : 'Selecciona una comuna válida.'),
  terms: v => (v ? '' : 'Debes aceptar los términos.')
};

export const loginRules = {
  email: validateEmail,
  password: v => (String(v ?? '') ? '' : 'La contraseña es obligatoria.')
};

export const contactRules = {
  name: v => validateName(v),
  email: validateEmail,
  message: v => {
    const len = String(v ?? '').trim().length;
    return len >= 10 && len <= 500 ? '' : 'El mensaje debe tener entre 10 y 500 caracteres.';
  }
};

export const addressRules = {
  street: v => (String(v ?? '').trim().length >= 5 ? '' : 'Ingresa calle y número (mín. 5 caracteres).'),
  region: v => required(v, 'La región'),
  comuna: (v, all) => (REGIONES[all.region]?.includes(v) ? '' : 'Selecciona una comuna válida.')
};

export const cardRules = {
  cardName: v => (/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,70}$/.test(String(v ?? '').trim()) ? '' : 'Ingresa el nombre del titular.'),
  cardNumber: v => (String(v ?? '').replace(/\D/g, '').length === 16 ? '' : 'La tarjeta debe tener 16 dígitos.'),
  cardExpiry: v => validateExpiry(v),
  cardCvv: v => (/^\d{3}$/.test(String(v ?? '')) ? '' : 'Ingresa 3 dígitos.')
};

export function validateExpiry(value, today = new Date()) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(value ?? ''));
  if (!match) return 'Usa el formato MM/AA.';
  const lastDay = new Date(2000 + Number(match[2]), Number(match[1]), 0);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return lastDay < firstOfMonth ? 'La tarjeta está vencida.' : '';
}

export const checkoutRules = {
  name: v => validateName(v),
  lastName: v => validateName(v, 'El apellido'),
  email: validateEmail,
  ...addressRules,
  ...cardRules
};

export function productRules(categories) {
  return {
    title: v => {
      const len = String(v ?? '').trim().length;
      return len >= 2 && len <= 80 ? '' : 'El título debe tener entre 2 y 80 caracteres.';
    },
    category: v => (categories.includes(v) ? '' : 'Selecciona una categoría válida.'),
    platform: v => (PLATFORMS.includes(v) ? '' : 'Selecciona una plataforma.'),
    price: v => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 990 && n <= 120000 ? '' : 'Precio entero entre $990 y $120.000.';
    },
    stock: v => {
      const n = Number(v);
      return v !== '' && Number.isInteger(n) && n >= 0 && n <= 999 ? '' : 'Stock entero entre 0 y 999.';
    },
    discount: v => {
      const n = Number(v || 0);
      return Number.isInteger(n) && n >= 0 && n <= 90 ? '' : 'Descuento entre 0% y 90%.';
    },
    rating: v => {
      const n = Number(v);
      return v !== '' && n >= 1 && n <= 5 ? '' : 'Valoración entre 1 y 5.';
    },
    image: v => (!v || isHttpUrl(v) ? '' : 'Ingresa una URL http(s) válida o déjalo vacío.'),
    description: v => {
      const len = String(v ?? '').trim().length;
      return len >= 20 && len <= 240 ? '' : 'La descripción debe tener entre 20 y 240 caracteres.';
    }
  };
}

export const userRules = {
  name: v => validateName(v),
  lastName: v => validateName(v, 'El apellido'),
  email: validateEmail,
  password: validatePassword,
  role: v => (['admin', 'usuario'].includes(v) ? '' : 'Selecciona un rol válido.')
};

export const categoryRules = {
  name: v => (/^[\p{L}\p{N}][\p{L}\p{N}\s&+\-/]{1,29}$/u.test(String(v ?? '').trim()) ? '' : 'Usa entre 2 y 30 caracteres sin símbolos especiales.'),
  description: v => (String(v ?? '').trim().length <= 120 ? '' : 'Máximo 120 caracteres.')
};
