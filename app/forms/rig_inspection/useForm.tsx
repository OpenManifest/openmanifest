import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { startOfDay } from 'date-fns';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type {
  DropzoneUserProfileQuery,
  DropzoneUserProfileQueryVariables,
} from 'app/api/operations';
import {
  DropzoneDocument,
  DropzoneUserProfileDocument,
  useCreateRigInspectionMutation,
} from 'app/api/reflection';
import type { Query } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { FieldItem } from '../rig_inspection_template/fieldItem';

export type RigInspectionFields = {
  /** The template's fields with the inspector's answers in `value` */
  fields: FieldItem[];
  /** Whether the rig is OK to jump */
  ok: boolean;
};

const isBlank = (value: FieldItem['value']) =>
  value === undefined || value === null || value === '';

/**
 * The fields come from the dropzone's template, so the rules do too: a rig can only be marked OK to jump once the
 * fields the template marks as required have an answer (a rig that is not OK can be recorded with gaps).
 */
export function buildRigInspectionValidation(template: FieldItem[]) {
  return yup.object({
    ok: yup.boolean().default(false),
    fields: yup
      .array()
      .default([])
      .test('required-fields', 'Fill in the required fields', function validateRequired(value) {
        if (!this.parent.ok) {
          return true;
        }
        const missing = ((value as FieldItem[] | undefined) ?? template).findIndex(
          (field) => field.isRequired && field.valueType !== 'boolean' && isBlank(field.value)
        );
        return missing === -1
          ? true
          : this.createError({
              path: `fields.${missing}.value`,
              message: `${template[missing]?.label || 'This field'} is required`,
            });
      }),
  });
}

export interface IUseRigInspectionFormOpts {
  /** The fields to show: an earlier inspection of this rig, or else the dropzone's template */
  fields: FieldItem[];
  ok?: boolean;
  rigId?: string;
  dropzoneId?: string;
  onSuccess?(): void;
}

export default function useRigInspectionForm(opts: IUseRigInspectionFormOpts) {
  const { fields, ok = false, rigId, dropzoneId, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo<RigInspectionFields>(() => ({ fields, ok }), [fields, ok]);
  const [defaultValues, setDefaultValues] = React.useState(initialValues);
  const validation = React.useMemo(() => buildRigInspectionValidation(fields), [fields]);

  const methods = useForm<RigInspectionFields>({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(validation) as never,
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

  const [mutationCreateRigInspection, { loading }] = useCreateRigInspectionMutation();

  const [, onSave] = useAsyncFn(
    async (values: RigInspectionFields) => {
      try {
        await mutationCreateRigInspection({
          variables: {
            dropzone: dropzoneId,
            rig: rigId,
            definition: JSON.stringify(values.fields),
            isOk: !!values.ok,
          },
          update: async (client, mutationResult) => {
            const rigInspection = mutationResult.data?.createRigInspection?.rigInspection;
            const result = client.readQuery<
              DropzoneUserProfileQuery,
              DropzoneUserProfileQueryVariables
            >({
              query: DropzoneUserProfileDocument,
              variables: {
                id: dropzoneId as string,
              },
            });

            const currentDz = client.readQuery<Query>({
              query: DropzoneDocument,
              variables: {
                dropzoneId: dropzoneId?.toString() as string,
                earliestTimestamp: startOfDay(new Date()).toISOString(),
              },
            });

            if (currentDz?.dropzone?.currentUser?.id === rigInspection?.dropzoneUser?.id) {
              client.writeQuery({
                query: DropzoneDocument,
                variables: {
                  dropzoneId: dropzoneId?.toString() as string,
                  earliestTimestamp: startOfDay(new Date()).toISOString(),
                },
                data: {
                  ...currentDz,
                  dropzone: {
                    ...currentDz?.dropzone,
                    currentUser: {
                      ...currentDz?.dropzone?.currentUser,
                      rigInspections: [
                        ...(currentDz?.dropzone?.currentUser?.rigInspections || []).filter(
                          (ins) => ins.id !== rigInspection?.id
                        ),
                        rigInspection,
                      ],
                    },
                  },
                },
              });
            }

            const newData = {
              dropzoneUser: {
                rigInspections: [
                  ...(result?.dropzoneUser?.rigInspections || []).filter(
                    (ins) => ins.id !== rigInspection?.id
                  ),
                  rigInspection,
                ],
              },
            };

            client.writeQuery({
              query: DropzoneUserProfileDocument,
              variables: {
                dropzoneId: dropzoneId?.toString() as string,
                dropzoneUserId: Number(rigInspection?.dropzoneUser?.id),
              },
              data: newData,
            });
            return {
              data: newData,
            };
          },
        });

        notify.success('Rig inspection saved');
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [dropzoneId, mutationCreateRigInspection, notify, onSuccess, rigId]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
