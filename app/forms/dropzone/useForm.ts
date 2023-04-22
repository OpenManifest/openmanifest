import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { isEqual } from 'lodash';
import { DropzoneInput, Permission } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { DropzoneEssentialsFragment, FederationEssentialsFragment } from 'app/api/operations';
import { useFederationsQuery } from 'app/api/reflection';
import useRestriction from 'app/hooks/useRestriction';

export type DropzoneFields = Required<Omit<DropzoneInput, 'settings' | 'federation' | 'id'> & DropzoneInput['settings'] & { id: number; federation: FederationEssentialsFragment | null }>;

export const dropzoneValidation = yup.object({
  name: yup.string().nullable().default(null),
  federation: yup.object().required('Your dropzone must be part of a federation'),
  lat: yup.number().required('You must specify a latitude'),
  lng: yup.number().required('You must specify a longitude'),
  primaryColor: yup.string(),
  requireRigInspection: yup.boolean(),
  requireLicense: yup.boolean(),
  requireCredits: yup.boolean(),
  requireMembership: yup.boolean(),
  allowNegativeCredits: yup.boolean(),
  allowManifestBypass: yup.boolean(),
  allowDoubleManifesting: yup.boolean()
});

export const EMPTY_FORM_VALUES: Partial<DropzoneFields> = {
  id: undefined,
  federation: null,
  lat: null,
  lng: null,
  primaryColor: null,
  requireRigInspection: true,
  requireMembership: true,
  allowNegativeCredits: false,
  allowManifestBypass: false,
  requireCredits: true,
  requireLicense: true,
};

export interface IUseManifestFormOpts {
  initial?: Partial<DropzoneFields>;
  onSuccess?(dropzone: DropzoneEssentialsFragment): void;
}

export default function useDropzoneForm(opts: IUseManifestFormOpts) {
  const { initial, onSuccess } = opts;
  const notify = useNotifications();
  const { data } = useFederationsQuery();
  const { dropzone: { dropzone } } = useDropzoneContext();
  const initialValues = React.useMemo(() => ({
    ...EMPTY_FORM_VALUES,
    id: dropzone?.id ? Number(dropzone?.id) : undefined,
    lat: dropzone?.lat || undefined,
    lng: dropzone?.lng || undefined,
    federation: dropzone?.federation || data?.federations?.[0] || undefined,
    name: dropzone?.name || undefined,
    primaryColor: dropzone?.primaryColor || undefined,
    secondaryColor: dropzone?.secondaryColor || undefined,
    allowManifestBypass: dropzone?.settings?.allowManifestBypass || undefined,
    allowNegativeCredits: dropzone?.settings?.allowNegativeCredits || undefined,
    allowDoubleManifesting: dropzone?.settings?.allowDoubleManifesting || undefined,
    requireCredits: dropzone?.settings?.requireCredits || undefined,
    requireLicense: dropzone?.settings?.requireLicense || undefined,
    requireMembership: dropzone?.settings?.requireMembership || undefined,
    requireRigInspection: dropzone?.settings?.requireRigInspection || undefined,
    isCreditSystemEnabled: dropzone?.isCreditSystemEnabled || undefined,
    ...initial
  }), [initial, dropzone?.name, data?.federations, dropzone?.primaryColor, dropzone?.secondaryColor, dropzone?.settings?.allowManifestBypass, dropzone?.settings?.allowNegativeCredits, dropzone?.settings?.allowDoubleManifesting, dropzone?.settings?.requireCredits, dropzone?.settings?.requireLicense, dropzone?.settings?.requireMembership, dropzone?.settings?.requireRigInspection, dropzone?.isCreditSystemEnabled, dropzone?.id, dropzone?.lat, dropzone?.lng, dropzone?.federation]);

  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<DropzoneFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(dropzoneValidation),
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { handleSubmit, setError } = methods;
  const {
    dropzone: { update }
  } = useDropzoneContext();
  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);

  const [{ loading }, onUpdate] = useAsyncFn(
    async (fields: DropzoneFields) => {
      try {
        if (!canUpdateDropzone) {
          return { error: 'You don\'t have permission to update this dropzone' }
        }
        const validatedFields = dropzoneValidation.validateSync(fields);
        console.debug({ validatedFields });
        const { id, banner, isCreditSystemEnabled, federation, primaryColor, lat, lng, name, requestPublication, secondaryColor, isPublic, ...settings } = fields;

        const response = await update({
          banner,
          federation: federation?.id ? Number(federation?.id) : undefined,
          primaryColor,
          lat,
          lng,
          name,
          requestPublication,
          isCreditSystemEnabled,
          isPublic,
          settings
        });

        if ('fieldErrors' in response) {
          response.fieldErrors?.forEach(({ field, message }) => {
            setError(field as keyof DropzoneFields, { type: 'custom', message });
          });
        }
        if ('dropzone' in response) {
          notify.success('Your changes have been saved');
          onSuccess?.(response.dropzone);
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [update, setError, canUpdateDropzone, notify, onSuccess]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onUpdate), [handleSubmit, onUpdate]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
