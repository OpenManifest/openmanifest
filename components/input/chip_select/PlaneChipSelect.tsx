import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { uniqBy } from "lodash";
import * as React from "react";
import { List } from "react-native-paper";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";
import { Plane, Query } from "../../../graphql/schema.d";
import ChipSelect from "./ChipSelect";


interface IPlaneSelect {
  value?: Plane | null;
  required?: boolean;
  userId?: number | null;
  onSelect(jt: Plane): void;
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

export default function PlaneChipSelect(props: IPlaneSelect) {
  const currentDropzone = useCurrentDropzone();
  
  const { data, loading, refetch } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(currentDropzone.dropzone?.id),
    }
  });

  return (
    <>
      <List.Subheader>
        Aircraft
      </List.Subheader>
      <ChipSelect
        autoSelectFirst
        items={uniqBy([
            ...(data?.planes || []),
          ], ({ id }) => id) || []
        }
        selected={[props.value].filter(Boolean)}
        renderItemLabel={(Plane) => Plane?.name}
        isDisabled={(plane) => false}
        onChangeSelected={([first]) =>
          first ? props.onSelect(first) : null
        }
      />
    </>
  )
}