import * as React from 'react';
import { useForm, UseFormReturn, useFormContext } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { FederationEssentialsFragment } from 'app/api/operations';

export type OperatorWizardFields = {
  /** Set once the operator has been created, so going back and forward updates it instead */
  id: string | null;
  name: string;
  federation: FederationEssentialsFragment | null;
  lat: number | null;
  lng: number | null;
  primaryColor: string;
  secondaryColor: string;
  banner: string;
};

export const EMPTY_WIZARD_VALUES: OperatorWizardFields = {
  id: null,
  name: '',
  federation: null,
  lat: null,
  lng: null,
  primaryColor: '',
  secondaryColor: '',
  banner: '',
};

export const operatorWizardValidation = yup.object({
  id: yup.string().nullable().default(null),
  name: yup.string().trim().required('Your dropzone must have a name'),
  federation: yup
    .object()
    .nullable()
    .required('Your dropzone must have an associated organization'),
  lat: yup.number().nullable().default(null),
  lng: yup.number().nullable().default(null),
  primaryColor: yup.string().required('Please pick a primary color'),
  secondaryColor: yup.string().default(''),
  banner: yup.string().default(''),
});

/** The form state of the operator setup wizard; the screen owns it and provides it to the steps. */
export function useOperatorWizardForm(): UseFormReturn<OperatorWizardFields> {
  return useForm<OperatorWizardFields>({
    defaultValues: EMPTY_WIZARD_VALUES,
    mode: 'onChange',
    resolver: yupResolver(operatorWizardValidation) as never,
    shouldUnregister: false,
  });
}

/** For the steps: the wizard's form with a setter that also clears the field's error. */
export function useOperatorWizardFields() {
  const methods = useFormContext<OperatorWizardFields>();
  const { setValue, clearErrors } = methods;

  const setField = React.useCallback(
    <K extends keyof OperatorWizardFields>(name: K, value: OperatorWizardFields[K]) => {
      setValue(name, value as never, { shouldDirty: true });
      clearErrors(name);
    },
    [clearErrors, setValue]
  );

  return { ...methods, setField };
}
