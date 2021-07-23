import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { uniqBy } from "lodash";
import * as React from "react";
import { List } from "react-native-paper";
import useCurrentDropzone from "../../../api/hooks/useCurrentDropzone";
import { Plane, Query } from "../../../api/schema.d";
import { useAppSelector } from "../../../state";
import ChipSelect from "./ChipSelect";
import ChipSelectSkeleton from "./ChipSelectSkeleton";


interface IPlaneSelect {
  value?: Plane | null;
  required?: boolean;
  userId?: number | null;
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(jt: Plane): void;
}

const QUERY_PLANES = gql`
  query QuerySelectPlanes(
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
  const { value, onSelect, onLoadingStateChanged } = props;
  const { currentDropzoneId } = useAppSelector(state => state.global);
  
  const { data, loading, refetch } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: currentDropzoneId,
    }
  });
  
  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading]);

  return (
    loading
    ? <ChipSelectSkeleton /> 
    : <>
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
          renderItemLabel={(plane) => plane?.name}
          isDisabled={(plane) => false}
          onChangeSelected={([first]) =>
            first ? onSelect(first) : null
          }
        />
      </>
  )
}