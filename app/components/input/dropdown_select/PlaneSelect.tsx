import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import { Plane, Query } from '../../../api/schema.d';

interface IPlaneSelect {
  value?: Plane | null;
  required?: boolean;
  onSelect(plane: Plane): void;
}

const QUERY_PLANES = gql`
  query QueryPlanes($dropzoneId: Int!) {
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

export default function PlaneSelect(props: IPlaneSelect) {
  const { onSelect, value, required } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const currentDropzone = useCurrentDropzone();

  const { data } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    },
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
          title={value?.name || 'No plane selected'}
          description={!required ? 'Optional' : null}
          right={() => <List.Icon icon="airplane" />}
        />
      }
    >
      {data?.planes?.map((plane) => (
        <Menu.Item
          key={`plane-select-${plane.id}`}
          onPress={() => {
            setMenuOpen(false);
            onSelect(plane);
          }}
          title={plane.name || '-'}
        />
      ))}
    </Menu>
  );
}
