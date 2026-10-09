import * as React from 'react';
import { useForm, UseFormReturn, useFormContext } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { FederationEssentialsFragment } from 'app/api/operations';

export type DropzoneWizardFields = {
  /** Set once the dropzone has been created, so going back and forward updates it instead */
  id: string | null;
  name: string;
  federation: FederationEssentialsFragment | null;
  lat: number | null;
  lng: number | null;
  primaryColor: string;
  secondaryColor: string;
  banner: string;
};

export const EMPTY_WIZARD_VALUES: DropzoneWizardFields = {
  id: null,
  name: '',
  federation: null,
  lat: null,
  lng: null,
  primaryColor: '',
  secondaryColor: '',
  banner: '',
};

export const dropzoneWizardValidation = yup.object({
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

/** The form state of the dropzone setup wizard; the screen owns it and provides it to the steps. */
export function useDropzoneWizardForm(): UseFormReturn<DropzoneWizardFields> {
  return useForm<DropzoneWizardFields>({
    defaultValues: EMPTY_WIZARD_VALUES,
    mode: 'onChange',
    resolver: yupResolver(dropzoneWizardValidation) as never,
    shouldUnregister: false,
  });
}

/** For the steps: the wizard's form with a setter that also clears the field's error. */
export function useDropzoneWizardFields() {
  const methods = useFormContext<DropzoneWizardFields>();
  const { setValue, clearErrors } = methods;

  const setField = React.useCallback(
    <K extends keyof DropzoneWizardFields>(name: K, value: DropzoneWizardFields[K]) => {
      setValue(name, value as never, { shouldDirty: true });
      clearErrors(name);
    },
    [clearErrors, setValue]
  );

  return { ...methods, setField };
}
