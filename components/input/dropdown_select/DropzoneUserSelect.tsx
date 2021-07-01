import * as React from "react";
import { List, Menu, Title } from "react-native-paper";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";
import useQueryDropzoneUsers from "../../../graphql/hooks/useQueryDropzoneUsers";
import { DropzoneUser } from "../../../graphql/schema.d";
import { useAppSelector } from "../../../redux";

interface IDropzoneUserSelect {
  dropzoneId: number;
  requiredPermissions: string[];
  value: DropzoneUser | null;
  required?: boolean;
  label: string;
  onSelect(dzUser: DropzoneUser): void;
}




export default function DropzoneUserSelect(props: IDropzoneUserSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data, loading, refetch } = useQueryDropzoneUsers({
    variables: {
      dropzoneId: globalState.currentDropzoneId,
      permissions: props.requiredPermissions
    },
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
              if (!data?.edges?.length) {
                refetch();
              }
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
            <Menu.Item
              key={`user-select-${edge?.node!.id}`}
              style={{ width: "100%" }}
              onPress={() => {
                setMenuOpen(false);
                props.onSelect(edge?.node as DropzoneUser);
              }}
              title={
                edge?.node?.user?.name || "-"
              }
            />
          )
        }
      </Menu>
    </>
  )
}