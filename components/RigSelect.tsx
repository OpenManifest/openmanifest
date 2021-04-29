import { useLazyQuery, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import { List, Menu } from "react-native-paper";
import { Rig, Query } from "../graphql/schema";
import { useAppSelector } from "../redux";

interface IRigSelect {
  dropzoneId?: number;
  userId?: number;
  value?: Rig | null;
  required?: boolean;
  autoSelectFirst?: boolean;
  onSelect(rig: Rig): void;
}


const QUERY_RIGS = gql`
  query QueryAvailableRigs(
    $dropzoneId: Int!
    $userId: Int!
  ) {
    dropzone(id: $dropzoneId) {
      id
      dropzoneUser(userId: $userId) {
        id
        availableRigs {
          id
          make
          model
          canopySize
          serial

          user {
            id
          }
        }
      }
    }
  }
`;

export default function RigSelect(props: IRigSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const [fetchRigs, { data, }] = useLazyQuery<Query>(QUERY_RIGS);

  useEffect(() => {
    if (props.userId && props.dropzoneId) {
      fetchRigs({
        variables: {
          dropzoneId: Number(globalState.currentDropzone?.id),
          userId: Number(props.userId)
        }
      });
    }
  }, [props.userId, props.dropzoneId])

  useEffect(() => {
    if (!props.value && props.autoSelectFirst && data?.dropzone?.dropzoneUser?.availableRigs?.length) {
      props.onSelect(data.dropzone.dropzoneUser.availableRigs[0]);
    }
  }, [props.autoSelectFirst, JSON.stringify(data?.dropzone?.dropzoneUser?.availableRigs)])
  
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
        data?.dropzone?.dropzoneUser?.availableRigs?.map((rig) => 
          <Menu.Item
            key={`rig-select-${rig.id}`}
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(rig);
            }}
            title={
              `${rig?.make} ${rig?.model} (${rig?.canopySize} sqft) ${!rig.user ? "[DROPZONE RIG]": ""}`
            }
          />
        )
      }
    </Menu>
  )
}