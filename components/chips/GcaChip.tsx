import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { Chip, Menu } from "react-native-paper";
import useCurrentDropzone from "../../graphql/hooks/useCurrentDropzone";
import { Query, DropzoneUser, Permission } from "../../graphql/schema.d";
import useRestriction from "../../hooks/useRestriction";
import { useAppSelector } from "../../redux";

interface IGCAChipSelect {
  dropzoneId: number;
  value?: DropzoneUser | null;
  onSelect(user: DropzoneUser): void;
}



export const QUERY_PERMISSION_USER = gql`
  query QueryGCAUsers(
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
  const { currentDropzoneId } = useAppSelector(state => state.global);

  const { data } = useQuery<Query>(QUERY_PERMISSION_USER, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
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