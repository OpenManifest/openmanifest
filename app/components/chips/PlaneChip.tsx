import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { Chip, Menu } from 'react-native-paper';
import { Plane, Permission, Query } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import { useAppSelector } from '../../state';

interface IPlaneChipSelect {
  value?: Plane | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  onSelect(dzUser: Plane): void;
}

const QUERY_PLANES = gql`
  query QueryChipPlanes($dropzoneId: Int!) {
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
  const { small, color, backgroundColor, value, onSelect } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const { data } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);

  return !allowed ? (
    <Chip
      mode="outlined"
      icon="airplane-takeoff"
      selectedColor={color}
      style={{
        marginHorizontal: 4,
        backgroundColor,
        height: small ? 25 : undefined,
        alignItems: 'center',
      }}
      textStyle={{
        color,
        fontSize: small ? 12 : undefined,
      }}
    >
      {value?.name || 'No plane'}
    </Chip>
  ) : (
    <Menu
      onDismiss={() => setMenuOpen(false)}
      visible={isMenuOpen}
      anchor={
        <Chip
          mode="outlined"
          icon="airplane"
          selectedColor={color}
          style={{
            marginHorizontal: 4,
            backgroundColor,
            height: small ? 25 : undefined,
            alignItems: 'center',
            borderColor: color || undefined,
          }}
          textStyle={{ color, fontSize: small ? 12 : undefined }}
          onPress={() => allowed && setMenuOpen(true)}
        >
          {value?.name || 'No plane'}
        </Chip>
      }
    >
      {data?.planes?.map((plane) => (
        <Menu.Item
          key={`lm-plane-chip-${plane.id}`}
          onPress={() => {
            setMenuOpen(false);
            onSelect(plane as Plane);
          }}
          title={plane.name}
        />
      ))}
    </Menu>
  );
}
