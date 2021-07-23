import { useLazyQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import { Rig, Query } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';

interface IRigSelect {
  dropzoneId?: number;
  userId?: number;
  value?: Rig | null;
  required?: boolean;
  autoSelectFirst?: boolean;
  onSelect(rig: Rig): void;
}

const QUERY_RIGS = gql`
  query QueryAvailableRigs($dropzoneId: Int!, $userId: Int!) {
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
  const { userId, value, required, autoSelectFirst, onSelect, dropzoneId } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const [fetchRigs, { data }] = useLazyQuery<Query>(QUERY_RIGS);

  React.useEffect(() => {
    if (userId && dropzoneId) {
      fetchRigs({
        variables: {
          dropzoneId: currentDropzoneId,
          userId: Number(userId),
        },
      });
    }
  }, [userId, dropzoneId, fetchRigs, currentDropzoneId]);

  React.useEffect(() => {
    if (!value && autoSelectFirst && data?.dropzone?.dropzoneUser?.availableRigs?.length) {
      onSelect(data.dropzone.dropzoneUser.availableRigs[0]);
    }
  }, [autoSelectFirst, data?.dropzone.dropzoneUser?.availableRigs, onSelect, value]);

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
            value
              ? `${value?.make} ${value?.model} (${value?.canopySize || '?'}sqft)`
              : 'Select rig'
          }
          description={!required ? 'Optional' : null}
          left={() => <List.Icon icon="parachute" />}
        />
      }
    >
      {data?.dropzone?.dropzoneUser?.availableRigs?.map((rig) => (
        <Menu.Item
          key={`rig-select-${rig.id}`}
          onPress={() => {
            setMenuOpen(false);
            onSelect(rig);
          }}
          style={{ width: '100%' }}
          title={`${rig?.make} ${rig?.model} (${rig?.canopySize} sqft) ${
            !rig.user ? '[DROPZONE RIG]' : ''
          }`}
        />
      ))}
    </Menu>
  );
}
