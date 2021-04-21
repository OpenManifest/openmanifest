import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { Chip, List, Menu } from "react-native-paper";
import { DropzoneUser, Plane, Query } from "../graphql/schema";
import useRestriction from "../hooks/useRestriction";
import { useAppSelector } from "../redux";

interface IPlaneChipSelect {
  dropzoneId: number;
  value?: Plane | null;
  onSelect(dzUser: Plane): void;
}


const QUERY_PLANES = gql`
  query QueryPlanes(
    $dropzoneId: Int!
  ) {
    planes(dropzoneId: $dropzoneId) {
      id
      name
      registration
      hours
      minSlots
      maxSlots
      nextMaintenanceHours
      createdAt
    }
  }
`;

export default function PlaneChip(props: IPlaneChipSelect) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const globalState = useAppSelector(state => state.global);

  const { data } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone?.id),
    }
  });
  const allowed = useRestriction("updateLoad");

  return (
    !allowed ?
    <Chip mode="outlined" icon="airplane-takeoff">
      {props.value?.name || "No plane"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="airplane"
          style={{ marginHorizontal: 4 }}
          onPress={() => allowed && setMenuOpen(true)}
        >
          {props.value?.name || "No plane"}
        </Chip>
      }>
      {
        data?.planes?.map((plane) => 
          <List.Item
            onPress={() => {
              setMenuOpen(false);
              props.onSelect(plane as Plane);
            }}
            title={
              plane.name
            }
          />
        )
      }
    </Menu>
  ))
}