import { PlaneEssentialsFragment } from 'app/api/operations';
import { usePlanesQuery } from 'app/api/reflection';
import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';

interface IPlaneSelect {
  value?: PlaneEssentialsFragment | null;
  required?: boolean;
  onSelect(plane: PlaneEssentialsFragment): void;
}
export default function PlaneSelect(props: IPlaneSelect) {
  const { onSelect, value, required } = props;
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const currentDropzone = useCurrentDropzone();

  const { data } = usePlanesQuery({
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
