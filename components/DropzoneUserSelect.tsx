import React, { useState } from "react";
import { List, Menu, Title } from "react-native-paper";
import useQueryDropzoneUsers from "../graphql/hooks/useQueryDropzoneUsers";
import { DropzoneUser } from "../graphql/schema";
import { useAppSelector } from "../redux";

interface IDropzoneUserSelect {
  dropzoneId: number;
  requiredPermissions: string[];
  value: DropzoneUser | null;
  required?: boolean;
  label: string;
  onSelect(dzUser: DropzoneUser): void;
}




export default function DropzoneUserSelect(props: IDropzoneUserSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data, loading, refetch } = useQueryDropzoneUsers({
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id),
      permissions: props.requiredPermissions
    }
  });

  return (
    <>
      <Title>{props.label}</Title>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setMenuOpen(true);
            }}
            title={
              props.value?.user?.id ? props.value?.user.name : "No user selected"
            }
            style={{ width: "100%" }}
            right={() => <List.Icon icon="account" />}
            description={!props.required ? "Optional" : null}
          />
        }>
        {
          data?.edges?.map((edge) => 
            <List.Item
              style={{ width: "100%" }}
              onPress={() => {
                setMenuOpen(false);
                props.onSelect(edge?.node as DropzoneUser);
              }}
              title={
                edge?.node?.user?.name || "-"
              }
              description={
                edge?.node?.role?.name || null
              }
            />
          )
        }
      </Menu>
    </>
  )
}