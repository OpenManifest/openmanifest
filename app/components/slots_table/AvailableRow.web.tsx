import React from 'react';
import { DataTable } from 'react-native-paper';
import { LoadState } from 'app/api/schema.d';
import { useLoadContext, useManifestContext } from 'app/providers';
import { MembershipEssentialsFragment } from 'app/api/operations';
import MembershipAutocomplete from '../autocomplete/MembershipAutocomplete.web';
import DroppableSlot from './DragAndDrop/DroppableSlot';

export interface IAvailableRowProps {
  index: number;
  onPress(): void;
}
export default function AvailableRow(props: IAvailableRowProps) {
  const { onPress, index } = props;
  const {
    load: { load },
  } = useLoadContext();
  const { dialogs } = useManifestContext();

  const onSelectUser = React.useCallback(
    (user: MembershipEssentialsFragment) => {
      if (load) {
        dialogs.manifestUser.open({ load, slot: { membership: user } });
      }
    },
    [dialogs.manifestUser, load]
  );

  return (
    <DroppableSlot loadId={load?.id?.toString() || '0'} rowIndex={index}>
      <DataTable.Row testID="slot-row" style={{ paddingTop: 8 }}>
        <MembershipAutocomplete
          disabled={[LoadState.Cancelled, LoadState.Departed, LoadState.Completed].includes(
            load?.state as LoadState
          )}
          placeholder="- Available -"
          value={null}
          onChange={onSelectUser}
        />
      </DataTable.Row>
    </DroppableSlot>
  );
}
