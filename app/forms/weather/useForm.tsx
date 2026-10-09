import * as React from 'react';
import { FormProvider, useForm, useFormContext, UseFormReturn } from 'react-hook-form';
import * as yup from 'yup';
import camelCase from 'lodash/camelCase';
import { yupResolver } from '@hookform/resolvers/yup';
import useMutationCreateWeatherConditions from 'app/api/hooks/useMutationCreateWeatherConditions';
import type { WeatherConditionEssentialsFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';
import { useSession } from 'app/state';

export type WindFields = {
  altitude?: string | null;
  direction?: string | null;
  speed?: string | null;
};

export type WeatherFields = {
  /** The conditions being edited; `null` when there are none yet */
  id: string | null;
  winds: WindFields[];
  jumpRun: number;
  temperature: number;
};

export const MAX_WINDS = 5;

export const weatherValidation = yup.object({
  id: yup.string().nullable().default(null),
  winds: yup
    .array()
    .of(
      yup.object({
        altitude: yup.string().nullable(),
        direction: yup.string().nullable(),
        speed: yup.string().nullable(),
      })
    )
    .max(MAX_WINDS, `At most ${MAX_WINDS} altitudes`)
    .default([]),
  jumpRun: yup
    .number()
    .typeError('Jump run must be a number')
    .integer()
    .min(0, 'Jump run must be between 0 and 360')
    .max(360, 'Jump run must be between 0 and 360')
    .default(0),
  temperature: yup.number().typeError('Temperature must be a number').integer().default(0),
});

export const EMPTY_FORM_VALUES: WeatherFields = {
  id: null,
  winds: [],
  jumpRun: 0,
  temperature: 0,
};

export function toFormValues(record?: WeatherConditionEssentialsFragment | null): WeatherFields {
  if (!record) {
    return EMPTY_FORM_VALUES;
  }
  return {
    id: record.id,
    winds: (record.winds || []).map(({ altitude, direction, speed }) => ({
      altitude,
      direction,
      speed,
    })),
    jumpRun: record.jumpRun ?? 0,
    temperature: record.temperature ?? 0,
  };
}

type WeatherFormApi = {
  /** Starts editing the given conditions (or empty ones) */
  open(record?: WeatherConditionEssentialsFragment | null): void;
  /** Validates and saves. Resolves to whether the conditions were saved. */
  save(): Promise<boolean>;
  saving: boolean;
};

const WeatherFormApiContext = React.createContext<WeatherFormApi | null>(null);

/**
 * The weather conditions form is shared by the winds screen, the jump run screen and the weather wizard, which are
 * separate screens editing the same record, so the provider sits above the navigator that contains them.
 */
export function WeatherFormProvider(props: React.PropsWithChildren<object>) {
  const methods = useForm<WeatherFields>({
    defaultValues: EMPTY_FORM_VALUES,
    mode: 'onChange',
    resolver: yupResolver(weatherValidation) as never,
  });
  const { reset, getValues, setError, trigger } = methods;
  const notify = useNotifications();
  const dropzoneId = useSession((session) => session.currentDropzoneId);

  const mutation = useMutationCreateWeatherConditions({
    onSuccess: () => null,
    onFieldError: (field, message) => {
      const name = camelCase(field);
      if (name in EMPTY_FORM_VALUES) {
        setError(name as keyof WeatherFields, { type: 'server', message });
      }
    },
    onError: notify.error,
  });
  const { mutate } = mutation;

  const open = React.useCallback(
    (record?: WeatherConditionEssentialsFragment | null) => reset(toFormValues(record)),
    [reset]
  );

  const save = React.useCallback(async () => {
    if (!(await trigger())) {
      return false;
    }
    const values = getValues();
    const result = await mutate({
      id: Number(values.id),
      dropzoneId: Number(dropzoneId),
      winds: JSON.stringify(values.winds),
      jumpRun: values.jumpRun,
      temperature: values.temperature,
    });

    return !!result && !result.errors?.length && !result.fieldErrors?.length;
  }, [dropzoneId, getValues, mutate, trigger]);

  const api = React.useMemo(
    () => ({ open, save, saving: mutation.loading }),
    [open, save, mutation.loading]
  );

  return (
    <FormProvider {...methods}>
      <WeatherFormApiContext.Provider value={api}>{props.children}</WeatherFormApiContext.Provider>
    </FormProvider>
  );
}

export function useWeatherForm(): UseFormReturn<WeatherFields> & WeatherFormApi {
  const methods = useFormContext<WeatherFields>();
  const api = React.useContext(WeatherFormApiContext);
  if (!api) {
    throw new Error('useWeatherForm needs a WeatherFormProvider');
  }
  return { ...methods, ...api };
}
