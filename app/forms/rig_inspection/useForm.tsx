import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { startOfDay } from 'date-fns';
import isEqual from 'lodash/isEqual';
import { yupResolver } from '@hookform/resolvers/yup';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type { MembershipProfileQuery, MembershipProfileQueryVariables } from 'app/api/operations';
import {
  OperatorDocument,
  MembershipProfileDocument,
  useCreateEquipmentInspectionMutation,
} from 'app/api/reflection';
import type { Query } from 'app/api/schema.d';
import { useNotifications } from 'app/providers/notifications';
import { FieldItem } from '../rig_inspection_template/fieldItem';
import i18n from 'app/i18n';

export type RigInspectionFields = {
  /** The template's fields with the inspector's answers in `value` */
  fields: FieldItem[];
  /** Whether the rig is OK to jump */
  ok: boolean;
};

const isBlank = (value: FieldItem['value']) =>
  value === undefined || value === null || value === '';

/**
 * The fields come from the operator's template, so the rules do too: a rig can only be marked OK to jump once the
 * fields the template marks as required have an answer (a rig that is not OK can be recorded with gaps).
 */
export function buildRigInspectionValidation(template: FieldItem[]) {
  return yup.object({
    ok: yup.boolean().default(false),
    fields: yup
      .array()
      .default([])
      .test(
        'required-fields',
        i18n.t('forms.rig_inspection.fillInTheRequiredFields'),
        function validateRequired(value) {
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
                message: i18n.t('forms.rig_inspection.fieldIsRequired', {
                  field: template[missing]?.label || i18n.t('forms.rig_inspection.thisField'),
                }),
              });
        }
      ),
  });
}

export interface IUseRigInspectionFormOpts {
  /** The fields to show: an earlier inspection of this rig, or else the operator's template */
  fields: FieldItem[];
  ok?: boolean;
  rigId?: string;
  operatorId?: string;
  onSuccess?(): void;
}

export default function useRigInspectionForm(opts: IUseRigInspectionFormOpts) {
  const { fields, ok = false, rigId, operatorId, onSuccess } = opts;
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

  const [mutationCreateEquipmentInspection, { loading }] = useCreateEquipmentInspectionMutation();

  const [, onSave] = useAsyncFn(
    async (values: RigInspectionFields) => {
      try {
        await mutationCreateEquipmentInspection({
          variables: {
            operator: operatorId,
            rig: rigId,
            definition: JSON.stringify(values.fields),
            isOk: !!values.ok,
          },
          update: async (client, mutationResult) => {
            const rigInspection = mutationResult.data?.createEquipmentInspection?.rigInspection;
            const result = client.readQuery<
              MembershipProfileQuery,
              MembershipProfileQueryVariables
            >({
              query: MembershipProfileDocument,
              variables: {
                id: operatorId as string,
              },
            });

            const currentDz = client.readQuery<Query>({
              query: OperatorDocument,
              variables: {
                operatorId: operatorId?.toString() as string,
                earliestTimestamp: startOfDay(new Date()).toISOString(),
              },
            });

            if (currentDz?.operator?.currentUser?.id === rigInspection?.membership?.id) {
              client.writeQuery({
                query: OperatorDocument,
                variables: {
                  operatorId: operatorId?.toString() as string,
                  earliestTimestamp: startOfDay(new Date()).toISOString(),
                },
                data: {
                  ...currentDz,
                  operator: {
                    ...currentDz?.operator,
                    currentUser: {
                      ...currentDz?.operator?.currentUser,
                      rigInspections: [
                        ...(currentDz?.operator?.currentUser?.rigInspections || []).filter(
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
              membership: {
                rigInspections: [
                  ...(result?.membership?.rigInspections || []).filter(
                    (ins) => ins.id !== rigInspection?.id
                  ),
                  rigInspection,
                ],
              },
            };

            client.writeQuery({
              query: MembershipProfileDocument,
              variables: {
                operatorId: operatorId?.toString() as string,
                membershipId: Number(rigInspection?.membership?.id),
              },
              data: newData,
            });
            return {
              data: newData,
            };
          },
        });

        notify.success(i18n.t('forms.rig_inspection.rigInspectionSaved'));
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [operatorId, mutationCreateEquipmentInspection, notify, onSuccess, rigId]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
