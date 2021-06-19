import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { Chip, Menu } from "react-native-paper";
import useCurrentDropzone from "../../graphql/hooks/useCurrentDropzone";
import { Query, DropzoneUser, Permission } from "../../graphql/schema.d";
import useRestriction from "../../hooks/useRestriction";

interface IGCAChipSelect {
  dropzoneId: number;
  value?: DropzoneUser | null;
  onSelect(user: DropzoneUser): void;
}



const QUERY_DROPZONE_USERS = gql`
  query QueryDropzoneUsers(
    $dropzoneId: Int!
    $permissions: [Permission!]
  ) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUsers(permissions: $permissions) {
        edges {
          node {
            id
            role {
              id
              name
            }
            user {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export default function GCAChip(props: IGCAChipSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const currentDropzone = useCurrentDropzone();

  const { data } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
      permissions: ["actAsGCA"]
    }
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  return (
    !allowed ?
    <Chip mode="outlined" icon="radio-handheld">
      {props.value?.user?.name || "No gca"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="radio-handheld"
          style={{ marginHorizontal: 4 }}
          onPress={() => setMenuOpen(true)}
        >
          {props.value?.id ? props.value?.user?.name : "No gca"}
        </Chip>
      }>
      {
        data?.dropzone?.dropzoneUsers?.edges?.map((edge) => 
          <Menu.Item
            key={`gca-chip-${edge?.node?.id}`}
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(edge?.node);
            }}
            title={
              edge?.node?.user?.name
            }
          />
        )
      }
    </Menu>
  ))
}