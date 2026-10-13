import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useUpdateEquipmentInspectionTemplateMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';
import { FieldItem, parseFields } from './fieldItem';
import i18n from 'app/i18n';

export type EquipmentInspectionTemplateFields = {
  fields: FieldItem[];
};

export const FIELD_VALUE_TYPES = ['integer', 'boolean', 'date', 'string'] as const;

export const equipmentInspectionTemplateValidation = yup.object({
  fields: yup
    .array()
    .of(
      yup.object({
        label: yup
          .string()
          .trim()
          .required(() => i18n.t('forms.equipment_inspection_template.everyFieldNeedsAName')),
        description: yup.string().nullable(),
        isRequired: yup.boolean(),
        valueType: yup
          .string()
          .oneOf([...FIELD_VALUE_TYPES])
          .required(),
        value: yup.mixed().nullable(),
      })
    )
    .default([]),
});

export interface IUseEquipmentInspectionTemplateFormOpts {
  template?: { id: string; definition?: string | null } | null;
  operatorId?: string | null;
  onSuccess?(): void;
}

export default function useEquipmentInspectionTemplateForm(
  opts: IUseEquipmentInspectionTemplateFormOpts
) {
  const { template, operatorId, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo<EquipmentInspectionTemplateFields>(
    () => ({ fields: parseFields(template?.definition) }),
    [template?.definition]
  );
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<EquipmentInspectionTemplateFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(equipmentInspectionTemplateValidation) as never,
  });
  React.useEffect(() => {
    if (!isEqual(defaultValues, initialValues)) {
      setDefaultValues(initialValues);
    }
  }, [defaultValues, initialValues]);

  const { reset, handleSubmit } = methods;
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const [mutationUpdateForm, { loading }] = useUpdateEquipmentInspectionTemplateMutation();

  const [, onSave] = useAsyncFn(
    async ({ fields }: EquipmentInspectionTemplateFields) => {
      try {
        await mutationUpdateForm({
          variables: {
            formId: Number(template?.id),
            operatorId: Number(operatorId),
            definition: JSON.stringify(fields),
          },
        });
        notify.success(i18n.t('forms.equipment_inspection_template.templateSaved'));
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [operatorId, mutationUpdateForm, notify, onSuccess, template?.id]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
