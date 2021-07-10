import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { Chip, Menu } from "react-native-paper";
import useCurrentDropzone from "../../graphql/hooks/useCurrentDropzone";
import { Plane, Permission, Query } from "../../graphql/schema.d";
import useRestriction from "../../hooks/useRestriction";
import { useAppSelector } from "../../redux";

interface IPlaneChipSelect {
  value?: Plane | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  onSelect(dzUser: Plane): void;
}


const QUERY_PLANES = gql`
  query QueryChipPlanes(
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
  const { small, color, backgroundColor } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector(state => state.global);

  const { data } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
    }
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  return (
    !allowed ?
    <Chip
      mode="outlined"
      icon="airplane-takeoff"
      style={{ marginHorizontal: 4, backgroundColor, height: small ? 25 : undefined, alignItems: "center" }}
      textStyle={{ color, fontSize: small ? 12 : undefined }}
    >
      {props.value?.name || "No plane"}
    </Chip> : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="airplane"
          style={{ 
            marginHorizontal: 4,
            backgroundColor,
            height: small ? 25 : undefined,
            alignItems: "center",
            borderColor: color ? color : undefined,
          }}
          textStyle={{ color, fontSize: small ? 12 : undefined }}
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