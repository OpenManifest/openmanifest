import { UserRigDetailedFragment } from 'app/api/operations';
import { useAvailableRigsLazyQuery } from 'app/api/reflection';
import * as React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from 'app/state';
import Select from '../select/Select';

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
            backgroundColor: theme.colors.primary,
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

  const options = React.useMemo(
    () =>
      data?.availableRigs?.map((rig) => ({
        label: rig?.name || [rig?.make, rig?.model].join(' '),
        value: rig as UserRigDetailedFragment,
      })) || [],
    [data?.availableRigs]
  );

  const selected = React.useMemo(
    () => data?.availableRigs?.find((node) => node?.id === value?.id),
    [data?.availableRigs, value?.id]
  );

  return (
    <Select<UserRigDetailedFragment>
      label="Select rig"
      value={selected}
      options={options}
      onChange={onSelect}
    />
  );
}
