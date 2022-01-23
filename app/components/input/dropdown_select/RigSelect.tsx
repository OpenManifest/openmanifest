import { UserRigDetailedFragment } from 'app/api/operations';
import { useAvailableRigsLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { Text, View } from 'react-native';
import { List, Menu, TextInput, useTheme } from 'react-native-paper';
import { useAppSelector } from 'app/state';

interface IRigSelect {
  dropzoneUserId?: number;
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

export default function RigSelect(props: IRigSelect) {
  const { dropzoneUserId, value, autoSelectFirst, onSelect, tandem } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const [fetchRigs, { data }] = useAvailableRigsLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  React.useEffect(() => {
    if (dropzoneUserId) {
      fetchRigs({
        variables: {
          dropzoneUserId,
          isTandem: tandem || undefined,
        },
      });
    }
  }, [fetchRigs, currentDropzoneId, tandem, dropzoneUserId]);

  React.useEffect(() => {
    if (!value && autoSelectFirst && data?.availableRigs?.length) {
      onSelect(data.availableRigs[0]);
    }
  }, [autoSelectFirst, data?.availableRigs, onSelect, value]);

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
      {data?.availableRigs?.map((rig) => (
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
