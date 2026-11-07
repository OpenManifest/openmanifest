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
import { FieldItem } from '../equipment_inspection_template/fieldItem';
import i18n from 'app/i18n';

export type EquipmentInspectionFields = {
  /** The template's fields with the inspector's answers in `value` */
  fields: FieldItem[];
  /** Whether the equipment is OK to jump */
  ok: boolean;
};

const isBlank = (value: FieldItem['value']) =>
  value === undefined || value === null || value === '';

/**
 * The fields come from the operator's template, so the rules do too: a equipment can only be marked OK to jump once the
 * fields the template marks as required have an answer (a equipment that is not OK can be recorded with gaps).
 */
export function buildEquipmentInspectionValidation(template: FieldItem[]) {
  return yup.object({
    ok: yup.boolean().default(false),
    fields: yup
      .array()
      .default([])
      .test(
        'required-fields',
        i18n.t('forms.equipment_inspection.fillInTheRequiredFields'),
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
                message: i18n.t('forms.equipment_inspection.fieldIsRequired', {
                  field: template[missing]?.label || i18n.t('forms.equipment_inspection.thisField'),
                }),
              });
        }
      ),
  });
}

export interface IUseEquipmentInspectionFormOpts {
  /** The fields to show: an earlier inspection of this equipment, or else the operator's template */
  fields: FieldItem[];
  ok?: boolean;
  equipmentId?: string;
  operatorId?: string;
  onSuccess?(): void;
}

export default function useEquipmentInspectionForm(opts: IUseEquipmentInspectionFormOpts) {
  const { fields, ok = false, equipmentId, operatorId, onSuccess } = opts;
  const notify = useNotifications();
  const initialValues = React.useMemo<EquipmentInspectionFields>(
    () => ({ fields, ok }),
    [fields, ok]
  );
  const [defaultValues, setDefaultValues] = React.useState(initialValues);
  const validation = React.useMemo(() => buildEquipmentInspectionValidation(fields), [fields]);

  const methods = useForm<EquipmentInspectionFields>({
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
    async (values: EquipmentInspectionFields) => {
      try {
        await mutationCreateEquipmentInspection({
          variables: {
            operator: operatorId,
            equipment: equipmentId,
            definition: JSON.stringify(values.fields),
            isOk: !!values.ok,
          },
          update: async (client, mutationResult) => {
            const equipmentInspection =
              mutationResult.data?.createEquipmentInspection?.equipmentInspection;
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

            if (currentDz?.operator?.currentUser?.id === equipmentInspection?.membership?.id) {
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
                      equipmentInspections: [
                        ...(currentDz?.operator?.currentUser?.equipmentInspections || []).filter(
                          (ins) => ins.id !== equipmentInspection?.id
                        ),
                        equipmentInspection,
                      ],
                    },
                  },
                },
              });
            }

            const newData = {
              membership: {
                equipmentInspections: [
                  ...(result?.membership?.equipmentInspections || []).filter(
                    (ins) => ins.id !== equipmentInspection?.id
                  ),
                  equipmentInspection,
                ],
              },
            };

            client.writeQuery({
              query: MembershipProfileDocument,
              variables: {
                operatorId: operatorId?.toString() as string,
                membershipId: Number(equipmentInspection?.membership?.id),
              },
              data: newData,
            });
            return {
              data: newData,
            };
          },
        });

        notify.success(i18n.t('forms.equipment_inspection.equipmentInspectionSaved'));
        onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          notify.error(error.message);
        }
      }
    },
    [operatorId, mutationCreateEquipmentInspection, notify, onSuccess, equipmentId]
  );

  const onSubmit = React.useMemo(() => handleSubmit(onSave), [handleSubmit, onSave]);

  return React.useMemo(() => ({ ...methods, onSubmit, loading }), [methods, onSubmit, loading]);
}
