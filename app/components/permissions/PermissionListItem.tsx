import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { List, Switch } from "react-native-paper";
import { Mutation, Permission, UserRole } from "../../api/schema.d";
import useRestriction from "../../hooks/useRestriction";
import { actions, useAppDispatch } from "../../state";

interface IPermissionListItem {
  title: string;
  description?: string;
  role: UserRole;
  permissionName: string;
}

const MUTATION_UPDATE_ROLE = gql`
  mutation UpdateRole($roleId: Int!, $permissionName: String!, $enabled: Boolean!) {
    updateRole(input: {
      id: $roleId,
      permission: $permissionName,
      enabled: $enabled
    }) {
      role {
        id
        name
        permissions
      }
      fieldErrors {
        field
        message
      }
      errors
    }
  }
`;

export default function PermissionListItem(props: IPermissionListItem) {
  const { title, description, role, permissionName } = props;
  const canChangePermissions = useRestriction(Permission.GrantPermission);
  const [mutationUpdatePermission, mutation] = useMutation<Mutation>(MUTATION_UPDATE_ROLE);
  const dispatch = useAppDispatch();

  return (
    <List.Item
      disabled={!canChangePermissions}
      style={{ width: "100%" }}
      right={() =>
        <Switch
          value={role.permissions.includes(permissionName)}
          onValueChange={async () => {
            const result = await mutationUpdatePermission({
              variables: {
                roleId: Number(role.id),
                permissionName,
                enabled: !role.permissions.includes(permissionName)
              },
              optimisticResponse: {
                updateRole: {
                  role: {
                    ...role,
                    permissions: !role.permissions.includes(permissionName)
                      ? role.permissions.filter((name) => name !== permissionName)
                      : [...role.permissions, permissionName]
                  }
                }
              }
            });

            if (result?.data?.updateRole?.errors?.length) {
              result?.data?.updateRole?.errors?.map((message) =>
                dispatch(actions.notifications.showSnackbar({ message, variant: "error" }))
              );
              return;
            }
          }}
        />
      }
      {...{ title, description }}
    />
  );
}