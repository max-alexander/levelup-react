import { useState } from 'react';
import { runValidators } from '../utils/validators';

/**
 * Estado de formulario controlado + validación.
 * - handleChange actualiza el campo (soporta checkbox) y limpia su error.
 * - validate() ejecuta las reglas y devuelve true si no hay errores.
 */
export function useForm(initialValues, rules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    const next = type === 'checkbox' ? checked : value;
    setValues(current => ({ ...current, [name]: next }));
    setErrors(current => {
      if (!current[name]) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  };

  const validate = () => {
    const found = runValidators(values, rules);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  return { values, setValues, errors, setErrors, handleChange, validate };
}
