import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { List, Menu } from "react-native-paper";
import { Query, UserRole } from "../../../graphql/schema";
import { useAppSelector } from "../../../redux";


interface IRoleSelect {
  value?: UserRole | null;
  required?: boolean;
  disabled?: boolean;
  onSelect(jt: UserRole): void;
}

const QUERY_ROLES = gql`
  query RolesQuery($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      roles {
        id
        name
      }
    }
  }
`;

export default function RoleSelect(props: IRoleSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data, loading, refetch } = useQuery<Query>(QUERY_ROLES, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id),
    }
  });
  return (
    <>
    <List.Subheader style={{ paddingLeft: 0 }}>
      Access level
    </List.Subheader>
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={!props.disabled && isMenuOpen}
      anchor={
        <List.Item
          left={() => <List.Icon icon="lock" />}
          onPress={props.disabled ? undefined : () => {
            setMenuOpen(true);
          }}
          title={
            props.value?.name || "Access level"
          }
          description={!props.required ? "Optional" : null}
        />
      }>
      {
        data?.dropzone?.roles?.map((role) =>
          <Menu.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(role);
            }}
            title={
              role.name || "-"
            }
          />
        )
      }
    </Menu>
    </>
  )
}