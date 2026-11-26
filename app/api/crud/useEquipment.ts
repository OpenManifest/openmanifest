import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useCreateEquipmentInspectionMutation,
} from '../reflection';
import {
  UpdateEquipmentMutationVariables,
  CreateEquipmentMutationVariables,
  EquipmentEssentialsFragment,
} from '../operations';
import { TMutationResponse } from './factory';

export function useEquipment() {
  const [createEquipment] = useCreateEquipmentMutation();
  const [updateEquipment] = useUpdateEquipmentMutation();
  const [inspectEquipment] = useCreateEquipmentInspectionMutation();

  const create = React.useCallback(
    async function CreateEquipment(
      variables: CreateEquipmentMutationVariables
    ): Promise<TMutationResponse<{ equipment: EquipmentEssentialsFragment }>> {
      const response = await createEquipment({ variables });

      if (response?.data?.createEquipment?.equipment?.id) {
        return { equipment: response?.data?.createEquipment?.equipment };
      }
      return {
        error: response?.data?.createEquipment?.errors?.[0],
        fieldErrors: response?.data?.createEquipment?.fieldErrors || undefined,
      };
    },
    [createEquipment]
  );

  const update = React.useCallback(
    async function UpdateEquipment(
      attributes: UpdateEquipmentMutationVariables
    ): Promise<TMutationResponse<{ equipment: EquipmentEssentialsFragment }>> {
      const response = await updateEquipment({ variables: attributes });

      if (response?.data?.updateEquipment?.equipment?.id) {
        return { equipment: response?.data?.updateEquipment?.equipment };
      }
      return {
        error: response?.data?.updateEquipment?.errors?.[0],
        fieldErrors: response?.data?.updateEquipment?.fieldErrors || undefined,
      };
    },
    [updateEquipment]
  );

  const add = React.useCallback(
    (attributes: CreateEquipmentMutationVariables & { id?: string }) => {
      if (attributes?.id) {
        return update({ ...attributes, id: Number(attributes?.id) });
      }
      return create(attributes);
    },
    [create, update]
  );

  return React.useMemo(
    () => ({
      create,
      update,
      add,
    }),
    [create, update, add]
  );
}
