import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  CrewRolesDocument,
  useArchiveCrewRoleMutation,
  useCreateCrewRoleMutation,
  useCrewRolesQuery,
  useUpdateCrewRoleMutation,
} from '../reflection';
import {
  CreateCrewRoleMutationVariables,
  CrewRoleEssentialsFragment,
  UpdateCrewRoleMutationVariables,
} from '../operations';
import { TMutationResponse } from './factory';

type CrewRoleResponse = TMutationResponse<{ crewRole: CrewRoleEssentialsFragment }>;
type Payload = {
  crewRole?: CrewRoleEssentialsFragment | null;
  errors?: string[] | null;
  fieldErrors?: { field: string; message: string }[] | null;
} | null;

function responseOf(payload: Payload | undefined): CrewRoleResponse {
  return payload?.crewRole
    ? { crewRole: payload.crewRole }
    : { error: payload?.errors?.[0], fieldErrors: payload?.fieldErrors ?? undefined };
}

/** The jobs on a load of the current operator (pilot, GCA, guide), and creating, changing and archiving them */
export function useCrewRoles() {
  const {
    operator: { operator },
  } = useOperatorContext();
  const operatorId = operator?.id?.toString();
  const { data, loading, refetch } = useCrewRolesQuery({
    variables: { operatorId: operatorId as string },
    skip: !operatorId,
  });
  const [createMutation] = useCreateCrewRoleMutation();
  const [updateMutation] = useUpdateCrewRoleMutation();
  const [archiveMutation] = useArchiveCrewRoleMutation();
  const refetchQueries = React.useMemo(
    () => [{ query: CrewRolesDocument, variables: { operatorId } }],
    [operatorId]
  );

  const create = React.useCallback(
    async (
      attributes: Omit<CreateCrewRoleMutationVariables['attributes'], 'operatorId'>
    ): Promise<CrewRoleResponse> => {
      const response = await createMutation({
        variables: { attributes: { ...attributes, operatorId: Number(operatorId) } },
        refetchQueries,
      });
      return responseOf(response.data?.createCrewRole);
    },
    [createMutation, operatorId, refetchQueries]
  );

  const update = React.useCallback(
    async (
      id: number,
      attributes: UpdateCrewRoleMutationVariables['attributes']
    ): Promise<CrewRoleResponse> => {
      const response = await updateMutation({ variables: { id, attributes }, refetchQueries });
      return responseOf(response.data?.updateCrewRole);
    },
    [updateMutation, refetchQueries]
  );

  const archive = React.useCallback(
    async (crewRole: CrewRoleEssentialsFragment): Promise<CrewRoleResponse> => {
      const response = await archiveMutation({
        variables: { id: Number(crewRole.id) },
        refetchQueries,
      });
      return responseOf(response.data?.archiveCrewRole);
    },
    [archiveMutation, refetchQueries]
  );

  return React.useMemo(
    () => ({
      crewRoles: data?.operator?.crewRoles ?? [],
      loading,
      refetch,
      create,
      update,
      archive,
    }),
    [data?.operator?.crewRoles, loading, refetch, create, update, archive]
  );
}

export default useCrewRoles;
