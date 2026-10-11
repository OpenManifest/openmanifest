import * as React from 'react';

export type FieldState<K extends string> = {
  values: Record<K, string>;
  errors: Record<K, string | null>;
  /** Sets a value and clears the field's error */
  setValue(field: K, value: string): void;
  setError(field: K, error: string | null): void;
};

/** Text field values and errors for a wizard whose steps are separate components. */
export function useFieldState<K extends string>(initial: Record<K, string>): FieldState<K> {
  const [values, setValues] = React.useState<Record<K, string>>(initial);
  const [errors, setErrors] = React.useState<Record<K, string | null>>(
    () => Object.fromEntries(Object.keys(initial).map((key) => [key, null])) as Record<K, null>
  );

  const setValue = React.useCallback((field: K, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: null }));
  }, []);
  const setError = React.useCallback((field: K, error: string | null) => {
    setErrors((current) => ({ ...current, [field]: error }));
  }, []);

  return React.useMemo(
    () => ({ values, errors, setValue, setError }),
    [values, errors, setValue, setError]
  );
}

/** A provider/hook pair so the steps of a wizard can read the state its screen owns. */
export function createFieldsContext<K extends string>(name: string) {
  const Context = React.createContext<FieldState<K> | null>(null);

  function useFields(): FieldState<K> {
    const fields = React.useContext(Context);
    if (!fields) {
      throw new Error(`${name} fields are only available inside their wizard`);
    }
    return fields;
  }

  return [Context.Provider, useFields] as const;
}
