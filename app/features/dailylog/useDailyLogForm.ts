import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { camelCase } from 'lodash';
import { useUpdateDailyLogMutation } from 'app/api/reflection';
import type { DailyLogEntryFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';
import { changed, valuesOf, type DailyLogValues } from './dailyLog';

/**
 * The duty officer and notes of a day: the form starts from the day's entry (and again when the day changes), and saving
 * writes them. The duty officer is required.
 */
export default function useDailyLogForm(opts: {
  operatorId?: string | null;
  date: string;
  entry?: DailyLogEntryFragment | null;
  onSaved?(): void;
}) {
  const { operatorId, date, entry, onSaved } = opts;
  const { t } = useTranslation('common');
  const notify = useNotifications();
  const initial = React.useMemo(() => valuesOf(entry), [entry]);
  const form = useForm<DailyLogValues>({ defaultValues: initial, mode: 'onChange' });
  const { reset, control, handleSubmit, setError } = form;
  const [update, { loading }] = useUpdateDailyLogMutation();

  React.useEffect(() => {
    reset(initial);
  }, [initial, reset]);

  const [dutyOfficerId, notes] = useWatch({ control, name: ['dutyOfficerId', 'notes'] });
  const dirty = changed(initial, { dutyOfficerId, notes: notes ?? '' });

  const save = React.useMemo(
    () =>
      handleSubmit(async (fields) => {
        if (!operatorId) return;
        if (!fields.dutyOfficerId) {
          setError('dutyOfficerId', {
            type: 'required',
            message: t('dailyLog.dutyOfficerRequired'),
          });
          return;
        }
        try {
          const { data } = await update({
            variables: {
              date,
              operator: operatorId,
              attributes: { dutyOfficer: fields.dutyOfficerId, notes: fields.notes.trim() || null },
            },
          });
          const result = data?.updateDailyLog;
          result?.fieldErrors?.forEach(({ field, message }) =>
            setError(camelCase(field) === 'dutyOfficer' ? 'dutyOfficerId' : 'notes', {
              type: 'server',
              message,
            })
          );
          if (result?.errors?.length) notify.error(result.errors[0]);
          else if (result?.dailyLog) {
            notify.success(t('dailyLog.saved'));
            onSaved?.();
          }
        } catch (error) {
          notify.error(error instanceof Error ? error.message : String(error));
        }
      }),
    [date, handleSubmit, notify, onSaved, operatorId, setError, t, update]
  );

  const discard = React.useCallback(() => reset(initial), [initial, reset]);

  return { form, dirty, saving: loading, save, discard };
}
