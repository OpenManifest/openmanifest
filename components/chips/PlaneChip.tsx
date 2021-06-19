import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { Chip, Menu } from "react-native-paper";
import useCurrentDropzone from "../../graphql/hooks/useCurrentDropzone";
import { Plane, Permission, Query } from "../../graphql/schema.d";
import useRestriction from "../../hooks/useRestriction";
import { useAppSelector } from "../../redux";

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
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const currentDropzone = useCurrentDropzone();

  const { data } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    }
  });
  const allowed = useRestriction(Permission.UpdateLoad);

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
          <Menu.Item
            key={`lm-plane-chip-${plane.id}`}
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