import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { DailyLogInput } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { useUpdateDailyLogMutation } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers';
import { DailyLogEntryFragment, DailyLogUserFragment } from 'app/api/operations';
import { camelCase, isEqual } from 'lodash';

export type DailyLogFields = Omit<DailyLogInput, 'dutyOfficer'> & {
  date: string | null;
  dutyOfficer: DailyLogUserFragment | null;
};

export const dailyLogValidation = yup.object({
  date: yup.string(),
  notes: yup.string().nullable().default(null),
  dutyOfficer: yup.object().required('You must select a DZSO'),
});

export const EMPTY_FORM_VALUES: Partial<DailyLogFields> = {
  dutyOfficer: null,
  date: null,
  notes: '',
};

export interface IUseDailyLogFormOpts {
  initial?: Partial<DailyLogFields>;
  onSuccess?(entry: DailyLogEntryFragment): void;
}

export default function useDailyLogForm(opts: IUseDailyLogFormOpts) {
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

  const methods = useForm<DailyLogFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(dailyLogValidation),
  });

  const { handleSubmit, reset, setError } = methods;
  const {
    operator: { operator },
  } = useOperatorContext();
  const [updateDailyLog] = useUpdateDailyLogMutation();

  React.useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const [{ loading }, onManifest] = useAsyncFn(
    async (fields: DailyLogFields) => {
      try {
        const validatedFields = dailyLogValidation.validateSync(fields);
        console.debug({ validatedFields, operator });
        if (!operator?.id) {
          return;
        }

        const { data: response } = await updateDailyLog({
          variables: {
            date: validatedFields.date,
            operator: operator?.id,
            attributes: {
              dutyOfficer: validatedFields.dutyOfficer?.id,
              notes: validatedFields.notes,
            },
          },
        });

        if (response?.updateDailyLog?.fieldErrors) {
          response?.updateDailyLog?.fieldErrors?.forEach(({ field, message }) => {
            setError(camelCase(field) as keyof DailyLogFields, { type: 'custom', message });
          });
        }
        if (response?.updateDailyLog?.dailyLog?.date) {
          notify.success('Master Log entry updated');
          onSuccess?.(response?.updateDailyLog?.dailyLog);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
          notify.error(error.message);
        }
      }
    },
    [operator, updateDailyLog]
  );

  const { notes, dutyOfficer } = useWatch<DailyLogFields>({ control: methods.control });
  const isDirty = React.useMemo(
    () =>
      !isEqual(
        { notes: initial?.notes, dutyOfficer: initial?.dutyOfficer?.id },
        { notes, dutyOfficer: dutyOfficer?.id }
      ),
    [dutyOfficer, initial, notes]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onManifest), [handleSubmit, onManifest]);

  return React.useMemo(
    () => ({ ...methods, isDirty, onSubmit, loading }),
    [methods, isDirty, onSubmit, loading]
  );
}
