import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { List, Menu } from "react-native-paper";
import { JumpType, Query } from "../graphql/schema";
import { useAppSelector } from "../redux";


interface IJumpTypeSelect {
  value?: JumpType | null;
  required?: boolean;
  userId?: number | null;
  onSelect(jt: JumpType): void;
}

const QUERY_JUMP_TYPES = gql`
  query JumpTypes($allowedForUserId: Int) {
    jumpTypes(allowedForUserId: $allowedForUserId) {
      id
      name
    }
  }
`;

export default function JumpTypeSelect(props: IJumpTypeSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const { data, loading, refetch } = useQuery<Query>(QUERY_JUMP_TYPES, {
    variables: {
      allowedForUserId: props.userId,
    }
  });
  return (
    <>
    <List.Subheader>
      Jump type
    </List.Subheader>
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <List.Item
          onPress={() => {
            setMenuOpen(true);
          }}
          title={
            props.value?.name || "Please select jump type"
          }
          description={!props.required ? "Optional" : null}
        />
      }>
      {
        data?.jumpTypes?.map((jumpType) => 
          <Menu.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(jumpType);
            }}
            title={
              jumpType.name || "-"
            }
          />
        )
      }
    </Menu>
    </>
  )
}