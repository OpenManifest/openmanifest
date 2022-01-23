import { JumpTypeEssentialsFragment } from 'app/api/operations';
import { useAllowedJumpTypesQuery } from 'app/api/reflection';
import { useAppSelector } from 'app/state';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';

interface IJumpTypeSelect {
  value?: JumpTypeEssentialsFragment | null;
  required?: boolean;
  allowedForDropzoneUserIds?: number[] | null;
  onSelect(jt: JumpTypeEssentialsFragment): void;
}

export default function JumpTypeSelect(props: IJumpTypeSelect) {
  const { allowedForDropzoneUserIds, onSelect, value, required } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { currentDropzoneId } = useAppSelector((state) => state.global);

  const { data } = useAllowedJumpTypesQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      allowedForDropzoneUserIds: allowedForDropzoneUserIds as number[],
    },
  });
  return (
    <>
      <List.Subheader>Jump type</List.Subheader>
      <Menu
        onDismiss={() => setMenuOpen(false)}
        visible={isMenuOpen}
        anchor={
          <List.Item
            onPress={() => {
              setMenuOpen(true);
            }}
            title={value?.name || 'Please select jump type'}
            description={!required ? 'Optional' : null}
          />
        }
      >
        {data?.jumpTypes?.map((jumpType) => (
          <Menu.Item
            onPress={() => {
              setMenuOpen(false);
              onSelect(jumpType);
            }}
            title={jumpType.name || '-'}
          />
        ))}
      </Menu>
    </>
  );
}
