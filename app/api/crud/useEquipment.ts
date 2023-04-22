import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useAppSelector } from 'app/state';
import {
  useCreateRigMutation,
  useUpdateRigMutation,
  useCreateRigInspectionMutation,
} from '../reflection';
import {
  UpdateRigMutationVariables,
  CreateRigMutationVariables,
  RigEssentialsFragment
} from '../operations';
import { TMutationResponse } from './factory';

export function useEquipment() {
  const [createRig] = useCreateRigMutation();
  const [updateRig] = useUpdateRigMutation();
  const [inspectRig] = useCreateRigInspectionMutation();

  const create = React.useCallback(
    async function CreateRig(
      variables: CreateRigMutationVariables
    ): Promise<TMutationResponse<{ rig: RigEssentialsFragment }>> {

      const response = await createRig({ variables });

      if (response?.data?.createRig?.rig?.id) {
        return { rig: response?.data?.createRig?.rig };
      }
      return {
        error: response?.data?.createRig?.errors?.[0],
        fieldErrors: response?.data?.createRig?.fieldErrors || undefined,
      };
    },
    [createRig]
  );

  const update = React.useCallback(
    async function UpdateRig(
      attributes: UpdateRigMutationVariables
    ): Promise<TMutationResponse<{ rig: RigEssentialsFragment }>> {
      const response = await updateRig({ variables: attributes });

      if (response?.data?.updateRig?.rig?.id) {
        return { rig: response?.data?.updateRig?.rig };
      }
      return {
        error: response?.data?.updateRig?.errors?.[0],
        fieldErrors: response?.data?.updateRig?.fieldErrors || undefined,
      };
    },
    [updateRig]
  );

  const add = React.useCallback((attributes: CreateRigMutationVariables & { id?: string }) => {
    if (attributes?.id) {
      return update({ ...attributes, id: Number(attributes?.id) });
    }
    return create(attributes);
  }, [create, update]);


  return React.useMemo(
    () => ({
      create,
      update,
      add
    }),
    [create, update, add]
  );
}
