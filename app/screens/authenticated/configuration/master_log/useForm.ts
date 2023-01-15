import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { MasterLogInput } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { useUpdateMasterLogMutation } from 'app/api/reflection';
import { useDropzoneContext } from 'app/providers';
import { MasterLogEntryFragment, MasterLogUserFragment } from 'app/api/operations';
import { isEqual } from 'lodash';

export type MasterLogFields = Omit<MasterLogInput, 'dzso'> & {
  date: string | null;
  dzso: MasterLogUserFragment | null;
};

export const masterLogValidation = yup.object({
  date: yup.string(),
  notes: yup.string().nullable().default(null),
  dzso: yup.object().required('You must select a DZSO'),
});

export const EMPTY_FORM_VALUES: Partial<MasterLogFields> = {
  dzso: null,
  date: null,
  notes: '',
};

export interface IUseMasterLogFormOpts {
  initial?: Partial<MasterLogFields>;
  onSuccess?(entry: MasterLogEntryFragment): void;
}

export default function useMasterLogForm(opts: IUseMasterLogFormOpts) {
  const { initial, onSuccess } = opts;
  const initialValues = React.useMemo(
    () => ({ ...EMPTY_FORM_VALUES, ...initial, notes: initial?.notes || '' }),
    [initial]
  );
  const [defaultValues, setDefaultValues] = React.useState(initialValues);
  const notify = useNotifications();
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const methods = useForm<MasterLogFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(masterLogValidation),
  });

  const { handleSubmit, reset, setError } = methods;
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const [updateMasterLog] = useUpdateMasterLogMutation();

  React.useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const [{ loading }, onManifest] = useAsyncFn(
    async (fields: MasterLogFields) => {
      try {
        const validatedFields = masterLogValidation.validateSync(fields);
        console.debug({ validatedFields, dropzone });
        if (!dropzone?.id) {
          return;
        }

        const { data: response } = await updateMasterLog({
          variables: {
            date: validatedFields.date,
            dropzone: dropzone?.id,
            attributes: {
              dzso: validatedFields.dzso?.id,
              notes: validatedFields.notes,
            },
          },
        });

        if (response?.updateMasterLog?.fieldErrors) {
          response?.updateMasterLog?.fieldErrors?.forEach(({ field, message }) => {
            setError(field as keyof MasterLogFields, { type: 'custom', message });
          });
        }
        if (response?.updateMasterLog?.masterLog?.date) {
          notify.success(`Master Log entry updated`);
          onSuccess?.(response?.updateMasterLog?.masterLog);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
          notify.error(error.message);
        }
      }
    },
    [dropzone, updateMasterLog]
  );

  const { notes, dzso } = useWatch<MasterLogFields>({ control: methods.control });
  const isDirty = React.useMemo(
    () => !isEqual({ notes: initial?.notes, dzso: initial?.dzso?.id }, { notes, dzso: dzso?.id }),
    [dzso, initial, notes]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onManifest), [handleSubmit, onManifest]);

  return React.useMemo(
    () => ({ ...methods, isDirty, onSubmit, loading }),
    [methods, isDirty, onSubmit, loading]
  );
}
