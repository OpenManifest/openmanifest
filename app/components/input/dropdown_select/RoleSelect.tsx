import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { List, Menu } from "react-native-paper";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";
import useDropzoneUser from "../../../graphql/hooks/useDropzoneUser";
import { Query, UserRole } from "../../../graphql/schema.d";
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
      roles(selectable: true) {
        id
        name
      }
    }
  }
`;

export default function RoleSelect(props: IRoleSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector(state => state.global);
  const { dropzoneUser } = useDropzoneUser();
  const { data, loading, refetch } = useQuery<Query>(QUERY_ROLES, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
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
            props.value?.name?.replace('_', ' ')?.toUpperCase() || "Access level"
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
              role.name?.replace('_', ' ').toUpperCase() || "-"
            }
          />
        )
      }
    </Menu>
    </>
  )
}