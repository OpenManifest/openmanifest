import { useLazyQuery } from '@apollo/client';
import { UserRigDetailedFragment } from 'app/api/operations';
import gql from 'graphql-tag';
import * as React from 'react';
import { Text, View } from 'react-native';
import { List, Menu, TextInput, useTheme } from 'react-native-paper';
import { Query } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';

interface IRigSelect {
  dropzoneId?: number;
  userId?: number;
  value?: UserRigDetailedFragment | null;
  tandem?: boolean;
  autoSelectFirst?: boolean;
  onSelect(rig: UserRigDetailedFragment): void;
}

function RigTitle(props: { rig: UserRigDetailedFragment }): JSX.Element {
  const theme = useTheme();
  const { rig } = props;
  const name = rig?.name || `${rig?.make} ${rig?.model}`;

  return (
    <>
      <Text>{`${name} (${rig?.canopySize} sqft)`}</Text>
      {!rig.user ? (
        <View
          style={{
            padding: 2,
            paddingHorizontal: 4,
            backgroundColor: theme.colors.accent,
            borderRadius: 16,
          }}
        >
          <Text style={{ fontSize: 10, color: 'white' }}>Dropzone rig</Text>
        </View>
      ) : null}
    </>
  );
}

const QUERY_RIGS = gql`
  query QueryAvailableRigs($dropzoneId: Int!, $userId: Int!, $isTandem: Boolean) {
    dropzone(id: $dropzoneId) {
      id
      dropzoneUser(userId: $userId) {
        id
        availableRigs(isTandem: $isTandem) {
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
  const { userId, value, autoSelectFirst, onSelect, dropzoneId, tandem } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const [fetchRigs, { data }] = useLazyQuery<Query>(QUERY_RIGS, {
    fetchPolicy: 'cache-and-network',
  });

  React.useEffect(() => {
    if (userId && dropzoneId) {
      fetchRigs({
        variables: {
          dropzoneId: currentDropzoneId,
          userId: Number(userId),
          isTandem: tandem || undefined,
        },
      });
    }
  }, [userId, dropzoneId, fetchRigs, currentDropzoneId, tandem]);

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
        <TextInput
          onTouchEnd={() => setMenuOpen(true)}
          label="Select rig"
          value={
            value
              ? `${value?.name || `${value?.make} ${value?.model}`} (${value?.canopySize} sqft)`
              : undefined
          }
          left={() => <List.Icon icon="parachute" />}
          editable={false}
          mode="outlined"
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
          title={<RigTitle rig={rig} />}
        />
      ))}
    </Menu>
  );
}
