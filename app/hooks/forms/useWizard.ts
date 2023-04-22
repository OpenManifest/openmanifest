import { useCallback, useState } from 'react';
import { DeepPartial, FieldPath, FieldValues, Merge, useForm as useHookForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useMemo } from '../react';

interface DefaultWizardStepFields {
  stepIndex: number;
  lastStepIndex: number;
}

export interface WizardFormStep<
  StepFields extends FieldValues = FieldValues,
  Validation extends yup.ObjectSchema<Shape<StepFields>> = yup.ObjectSchema<Shape<StepFields>>
> {
  defaultValues: DeepPartial<StepFields>;
  validation?: Validation;
}

type FormValues<T> = UnionToIntersection<T> & DefaultWizardStepFields;

type WizardStepValues<T extends WizardFormStep> = T['defaultValues'];
type WizardStepFields<Y extends WizardFormStep[]> = WizardStepValues<Y[number]>;

// rome-ignore lint/suspicious/noExplicitAny: Only way to get this working
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export interface IUseWizardFormOpts<
  Steps extends WizardFormStep[],
  MergedFields extends FieldValues = WizardStepFields<Steps>,
  WizardFields extends FieldValues = FormValues<MergedFields>,
// CombinedFields extends UnionToIntersection<WizardFields> = UnionToIntersection<WizardFields>
> {
  startIndex?: number;
  steps: Steps;
}

export interface IUseWizardNavigationHandlers<
  Steps extends WizardFormStep[],
  MergedFields extends FieldValues = WizardStepFields<Steps>,
  WizardFields extends FieldValues = FormValues<MergedFields>
> {
  onSubmit(fields: WizardFields, defaultValues: WizardFields): Promise<unknown>
  onSuccess?(): void;
  onClose?(): void;
}

export interface IUseWizardReturnValue<
  Steps extends WizardFormStep[],
  MergedFields extends FieldValues = WizardStepFields<Steps>,
  WizardFields extends FieldValues = FormValues<MergedFields>
> extends ReturnType<typeof useHookForm<WizardFields>> {
  loading: boolean;
  startIndex?: number;
  restore(): void;
  getStepIndexByFieldName(key: string): number | undefined;
  setIndex(index: number): void;
  setMaxIndex(index: number): void;
  createHandlers(params: IUseWizardNavigationHandlers<Steps, MergedFields, WizardFields>): {
    next(): Promise<void>;
    back(): Promise<void>;
  }
}


const INITIAL_WIZARD_VALUES: DefaultWizardStepFields = {
  stepIndex: 0,
  lastStepIndex: 0
};

export type ConditionalSchema<T> = T extends string
  ? yup.StringSchema
  : T extends number
  ? yup.NumberSchema
  : T extends boolean
  ? yup.BooleanSchema
  // rome-ignore lint/suspicious/noExplicitAny: Not used, and its hard to type yup
  : T extends Record<any, any>
  ? yup.AnyObjectSchema
  // rome-ignore lint/suspicious/noExplicitAny: Not used, and its hard to type yup
  : T extends Array<any>
  // rome-ignore lint/suspicious/noExplicitAny: Not used, and its hard to type yup
  ? yup.ArraySchema<any, any>
  : yup.AnySchema;

export type Shape<Fields> = {
  [Key in keyof Fields]: ConditionalSchema<Fields[Key]>;
};

const wizardSchema = yup.object({ stepIndex: yup.number().default(0), lastStepIndex: yup.number().default(0) });

function createValidators(validators: ReturnType<typeof yup.object>[]) {
  return yupResolver(
    validators?.reduce((acc, validator, index) => {
      return acc.when(({ stepIndex }) => {
        if (stepIndex >= index) {
          return acc.concat(validator);
        }
        return acc;
      });
    }, wizardSchema) || wizardSchema
  );
}

export function useWizardForm<
  Steps extends WizardFormStep[],
  MergedFields extends FieldValues = WizardStepFields<Steps>,
  WizardFields extends FieldValues = FormValues<MergedFields>,
// CombinedFields extends UnionToIntersection<WizardFields> = UnionToIntersection<WizardFields>
>(opts: IUseWizardFormOpts<Steps, MergedFields, WizardFields>): IUseWizardReturnValue<
  Steps,
  MergedFields,
  WizardFields
> {
  const { steps, startIndex } = opts;

  const [loading, setLoading] = useState(false);

  const initialValues: Partial<WizardFields> = useMemo(() =>
    Object.assign({}, ...steps?.map((step) => step?.defaultValues || {})),
    [steps]);

  const defaultValues = useMemo(() => ({
    ...INITIAL_WIZARD_VALUES,
    stepIndex: startIndex || 0,
    lastStepIndex: ((steps?.length || 1) - 1),
    ...initialValues,
  }), [initialValues, steps?.length, startIndex]);

  console.debug({ defaultValues });


  const form = useHookForm<WizardFields | typeof INITIAL_WIZARD_VALUES>({
    resolver: createValidators(steps?.map((step) => step?.validation).filter(Boolean) as ReturnType<typeof yup.object>[] || []),
    defaultValues,
    mode: 'all',
    shouldUnregister: false
  });


  const { reset, handleSubmit, setValue, control, formState } = form;
  const { stepIndex } = useWatch({ control });

  const restore = useCallback(() => reset(defaultValues), [defaultValues, reset]);
  useEffect(() => {
    console.debug('Resetting fields');
    reset(defaultValues);
  }, [defaultValues, reset]);


  const getStepIndexByFieldName = useCallback((fieldName: FieldPath<WizardFields>) => {
    const fieldIndex = steps?.findIndex((step) => Object.keys(step?.defaultValues || {}).includes(fieldName as string));
    return fieldIndex !== undefined ? fieldIndex : -1;
  }, [steps]);

  const setIndex = useCallback((index: number) => {
    setValue('stepIndex', index, { shouldValidate: false });
  }, [setValue]);

  const setMaxIndex = useCallback((index: number) => {
    setValue('lastStepIndex', index, { shouldValidate: false });
  }, [setValue]);


  const createHandlers = useCallback(({ onSubmit, onSuccess, onClose }: IUseWizardNavigationHandlers<Steps, MergedFields, WizardFields>): {
    next(): Promise<void>;
    back(): Promise<void>;
  } => ({
    back: async () => {
      if (stepIndex === (startIndex || 0)) {
        return onClose?.();
      }
      setValue('stepIndex', (stepIndex || 0) - 1);
    },
    next: handleSubmit(async (fields) => {
      setLoading(true);
      try {
        const successful = await onSubmit(fields as WizardFields, defaultValues as never);
        if (successful !== false && stepIndex < fields.lastStepIndex) {
          console.debug({ successful });
          setValue('stepIndex', (stepIndex || 0) + 1);
          return false;
        }
      } finally {
        setLoading(false);
      }
    })
  }), [defaultValues, handleSubmit, setValue, stepIndex]);


  return useMemo(() => ({
    ...form as ReturnType<typeof useHookForm<WizardFields>>,
    getStepIndexByFieldName,
    setIndex,
    startIndex: startIndex || 0,
    restore,
    setMaxIndex,
    createHandlers,
    loading,
  }), [setIndex, startIndex, restore, setMaxIndex, createHandlers, form, getStepIndexByFieldName, loading]);
}

