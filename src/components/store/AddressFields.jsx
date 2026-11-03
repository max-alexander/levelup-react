import FormField from '../common/FormField';
import { REGIONES, REGION_NAMES } from '../../data/regiones';

/** Campos de dirección reutilizados en registro, checkout y perfil. La comuna depende de la región. */
export default function AddressFields({ values, errors = {}, onChange, readOnly = false, showDetails = true }) {
  const handleRegion = event => {
    onChange({ target: { name: 'region', value: event.target.value } });
    onChange({ target: { name: 'comuna', value: '' } });
  };
  const comunas = REGIONES[values.region] ?? [];
  return (
    <div className="row g-3">
      {showDetails && (
        <>
          <FormField className="col-md-8" label="Calle y número" name="street" value={values.street} onChange={onChange} error={errors.street} required readOnly={readOnly} placeholder="Ej: Los Crisantemos 742" />
          <FormField className="col-md-4" label="Departamento (opcional)" name="apartment" value={values.apartment} onChange={onChange} readOnly={readOnly} placeholder="Ej: 603" />
        </>
      )}
      <FormField className="col-md-6" as="select" label="Región" name="region" value={values.region} onChange={handleRegion} error={errors.region} required disabled={readOnly}>
        <option value="">Selecciona una región</option>
        {REGION_NAMES.map(region => <option key={region} value={region}>{region}</option>)}
      </FormField>
      <FormField className="col-md-6" as="select" label="Comuna" name="comuna" value={values.comuna} onChange={onChange} error={errors.comuna} required disabled={readOnly || !values.region}>
        <option value="">Selecciona una comuna</option>
        {comunas.map(comuna => <option key={comuna} value={comuna}>{comuna}</option>)}
      </FormField>
      {showDetails && (
        <FormField className="col-12" as="textarea" rows={2} label="Indicaciones para la entrega (opcional)" name="notes" value={values.notes} onChange={onChange} readOnly={readOnly} placeholder="Ej: Entre calles, color del edificio, no tiene timbre." maxLength={200} />
      )}
    </div>
  );
}
