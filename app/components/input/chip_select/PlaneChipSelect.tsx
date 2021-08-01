import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { List } from 'react-native-paper';
import { Plane, Query } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IPlaneSelect {
  value?: Plane | null;
  onLoadingStateChanged?(loading: boolean): void;
  onSelect(jt: Plane): void;
}

const QUERY_PLANES = gql`
  query QuerySelectPlanes($dropzoneId: Int!) {
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
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data, loading } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: currentDropzoneId,
    },
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <List.Subheader>Aircraft</List.Subheader>
      <ChipSelect<Plane>
        autoSelectFirst
        items={uniqBy([...(data?.planes || [])], ({ id }) => id) || []}
        selected={[value].filter(Boolean) as Plane[]}
        renderItemLabel={(plane: Plane) => plane?.name || ''}
        isDisabled={(plane) => false}
        onChangeSelected={([first]) => (first ? onSelect(first as Plane) : null)}
      />
    </>
  );
}
