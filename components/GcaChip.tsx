import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { values } from "lodash";
import React, { useState } from "react";
import { Chip, List, Menu } from "react-native-paper";
import { DropzoneUser, Plane, Query, User } from "../graphql/schema";
import useRestriction from "../hooks/useRestriction";
import { useAppSelector } from "../redux";

interface IGCAChipSelect {
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

export default function GCAChip(props: IGCAChipSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id),
      permissions: ["actAsGCA"]
    }
  });
  const allowed = useRestriction("updateLoad");

  return (
    !allowed ?
    <Chip mode="outlined" icon="radio-handheld">
      {props.value?.name || "No gca"}
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
          {props.value?.id ? props.value?.name : "No gca"}
        </Chip>
      }>
      {
        data?.dropzone?.dropzoneUsers?.edges?.map((edge) => 
          <List.Item
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