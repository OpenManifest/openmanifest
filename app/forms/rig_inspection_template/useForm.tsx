import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useUpdateRigInspectionTemplateMutation } from 'app/api/reflection';
import { useNotifications } from 'app/providers/notifications';
import { FieldItem, parseFields } from './fieldItem';

export type RigInspectionTemplateFields = {
  fields: FieldItem[];
};

export const FIELD_VALUE_TYPES = ['integer', 'boolean', 'date', 'string'] as const;

export const rigInspectionTemplateValidation = yup.object({
  fields: yup
    .array()
    .of(
      yup.object({
        label: yup.string().trim().required('Every field needs a name'),
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

export interface IUseRigInspectionTemplateFormOpts {
  template?: { id: string; definition?: string | null } | null;
  dropzoneId?: string | null;
  onSuccess?(): void;
}

export default function useRigInspectionTemplateForm(opts: IUseRigInspectionTemplateFormOpts) {
  const { template, dropzoneId, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo<RigInspectionTemplateFields>(
    () => ({ fields: parseFields(template?.definition) }),
    [template?.definition]
  );
  const [defaultValues, setDefaultValues] = React.useState(initialValues);

  const methods = useForm<RigInspectionTemplateFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(rigInspectionTemplateValidation) as never,
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

  const [mutationUpdateForm, { loading }] = useUpdateRigInspectionTemplateMutation();

  const [, onSave] = useAsyncFn(
    async ({ fields }: RigInspectionTemplateFields) => {
      try {
        await mutationUpdateForm({
          variables: {
            formId: Number(template?.id),
            dropzoneId: Number(dropzoneId),
            definition: JSON.stringify(fields),
          },
        });
        notify.success('Template saved');
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [dropzoneId, mutationUpdateForm, notify, onSuccess, template?.id]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
