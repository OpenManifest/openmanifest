import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { Chip, Menu } from "react-native-paper";
import useCurrentDropzone from "../../graphql/hooks/useCurrentDropzone";
import { Query, DropzoneUser, Permission } from "../../graphql/schema.d";
import useRestriction from "../../hooks/useRestriction";
import { useAppSelector } from "../../redux";

interface IPilotChipSelect {
  dropzoneId: number;
  value?: DropzoneUser | null;
  onSelect(user: DropzoneUser): void;
}



const QUERY_DROPZONE_USERS = gql`
  query QueryPilotUsers(
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

export default function PilotChip(props: IPilotChipSelect) {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector(state => state.global);

  const { data } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: currentDropzoneId,
      permissions: ["actAsPilot"]
    }
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  return (
    !allowed ?
    <Chip mode="outlined" icon="radio-handheld">
      {props.value?.user?.name || "No pilot"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="shield-airplane"
          style={{ marginHorizontal: 4 }}
          onPress={() => setMenuOpen(true)}
        >
        {props.value?.id ? props.value?.user?.name : "No pilot"}
        </Chip>
      }>
      {
        data?.dropzone?.dropzoneUsers?.edges?.map((edge) => 
          <Menu.Item
            key={`pilot-select-${edge!.node!.id}`}
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