import React from 'react';
import { DataTable } from 'react-native-paper';
import { LoadState } from 'app/api/schema.d';
import { useLoadContext, useManifestContext } from 'app/providers';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import DropzoneUserAutocomplete from '../autocomplete/DropzoneUserAutocomplete.web';
import DroppableSlot from './DragAndDrop/DroppableSlot';

export interface IAvailableRowProps {
  index: number;
  onPress(): void;
}
export default function AvailableRow(props: IAvailableRowProps) {
  const { onPress, index } = props;
  const {
    load: { load }
  } = useLoadContext();
  const { dialogs } = useManifestContext();

  const onSelectUser = React.useCallback(
    (user: DropzoneUserEssentialsFragment) => {
      if (load) {
        dialogs.manifestUser.open({ load, slot: { dropzoneUser: user } });
      }
    },
    [dialogs.manifestUser, load]
  );

  return (
    <DroppableSlot loadId={load?.id?.toString() || '0'} rowIndex={index}>
      <DataTable.Row testID="slot-row" style={{ paddingTop: 8 }}>
        <DropzoneUserAutocomplete
          disabled={[LoadState.Cancelled, LoadState.InFlight, LoadState.Landed].includes(load?.state as LoadState)}
          placeholder="- Available -"
          value={null}
          onChange={onSelectUser}
        />
      </DataTable.Row>
    </DroppableSlot>
  );
}
