export function formatMoney(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

/** Precio final aplicando el % de descuento de oferta del producto. */
export function finalPrice(game) {
  const discount = Math.min(90, Math.max(0, Number(game?.discount) || 0));
  return Math.round((Number(game?.price) || 0) * (1 - discount / 100));
}

export function stockStatus(stock) {
  if (stock <= 0) return { level: 'out', label: 'Agotado' };
  if (stock <= 5) return { level: 'low', label: `Solo ${stock} disponibles` };
  return { level: 'ok', label: `${stock} disponibles` };
}

export function sanitizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}
