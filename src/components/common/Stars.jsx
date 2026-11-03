export default function Stars({ rating }) {
  const value = Number(rating) || 0;
  const rounded = Math.round(value);
  return (
    <span className="rating" aria-label={`Valoración ${value.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={`fa-${index < rounded ? 'solid' : 'regular'} fa-star`} aria-hidden="true" />
      ))}
      <span>{value.toFixed(1)}</span>
    </span>
  );
}
