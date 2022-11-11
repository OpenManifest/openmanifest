import React from 'react';
import { DataTable } from 'react-native-paper';
import { useLoadContext } from 'app/api/crud';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { useManifestContext } from 'app/api/crud/useManifest';
import DropzoneUserAutocomplete from '../autocomplete/DropzoneUserAutocomplete.web';
import DroppableSlot from './DragAndDrop/DroppableSlot';

export interface IAvailableRowProps {
  index: number;
  onPress(): void;
}
export default function AvailableRow(props: IAvailableRowProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onPress, index } = props;
  const { load } = useLoadContext();
  const { dialogs } = useManifestContext();

  const onSelectUser = React.useCallback(
    (user: DropzoneUserEssentialsFragment) => {
      if (load) {
        dialogs.user.open({ load, slot: { dropzoneUser: user } });
      }
    },
    [dialogs.user, load]
  );

  return (
    <DroppableSlot loadId={load?.id?.toString() || '0'} rowIndex={index}>
      <DataTable.Row testID="slot-row" style={{ paddingTop: 8 }}>
        <DropzoneUserAutocomplete
          placeholder="- Available -"
          value={null}
          onChange={onSelectUser}
        />
      </DataTable.Row>
    </DroppableSlot>
  );
}
