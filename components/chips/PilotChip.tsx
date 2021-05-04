import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { Chip, Menu } from "react-native-paper";
import { Query, User } from "../../graphql/schema";
import useRestriction from "../../hooks/useRestriction";
import { useAppSelector } from "../../redux";

interface IPilotChipSelect {
  dropzoneId: number;
  value?: User | null;
  onSelect(user: User): void;
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

export default function PilotChip(props: IPilotChipSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id),
      permissions: ["actAsPilot"]
    }
  });
  const allowed = useRestriction("updateLoad");

  return (
    !allowed ?
    <Chip mode="outlined" icon="radio-handheld">
      {props.value?.name || "No pilot"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="airplane-takeoff"
          style={{ marginHorizontal: 4 }}
          onPress={() => setMenuOpen(true)}
        >
        {props.value?.id ? props.value?.name : "No pilot"}
        </Chip>
      }>
      {
        data?.dropzone?.dropzoneUsers?.edges?.map((edge) => 
          <Menu.Item
            key={`pilot-select-${edge!.node!.id}`}
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(edge?.node?.user as User);
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