import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { List, Menu } from "react-native-paper";
import { Rig, Query } from "../graphql/schema";
import { useAppSelector } from "../redux";

interface IRigSelect {
  dropzoneId?: number;
  userId?: number;
  value?: Rig | null;
  required?: boolean;
  onSelect(rig: Rig): void;
}


const QUERY_RIGS = gql`
  query QueryRigs(
    $dropzoneId: Int
    $userId: Int
  ) {
    rigs(dropzoneId: $dropzoneId, userId: $userId) {
      id
      make
      model
      canopySize
      serial
    }
  }
`;

export default function RigSelect(props: IRigSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data } = useQuery<Query>(QUERY_RIGS, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id),
    }
  });
  return (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <List.Item
          onPress={() => {
            setMenuOpen(true);
          }}
          title={
            props.value
            ? `${props.value?.make} ${props.value?.model} (${props.value?.canopySize || "?"}sqft)`
            : 'Select rig'
          }
          description={!props.required ? "Optional" : null}
          left={() => <List.Icon icon="parachute" />}
        />
      }>
      {
        data?.rigs?.map((rig) => 
          <List.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(rig);
            }}
            title={
              `${props.value?.make} ${props.value?.model}`
            }
            description={
              `${props.value?.canopySize} sqft`
            }
          />
        )
      }
    </Menu>
  )
}