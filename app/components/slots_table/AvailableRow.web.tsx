import { StyleSheet } from 'react-native';
import React from 'react';
import { DataTable } from 'react-native-paper';
import { useLoadContext } from 'app/api/crud';
import { actions, useAppDispatch } from 'app/state';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import DropzoneUserAutocomplete from '../autocomplete/DropzoneUserAutocomplete.web';
import DroppableSlot from './DragAndDrop/DroppableSlot';

export interface IAvailableRowProps {
  index: number;
  onPress(): void;
}
export default function AvailableRow(props: IAvailableRowProps) {
  const { onPress, index } = props;
  const dispatch = useAppDispatch();
  const { load } = useLoadContext();

  const onSelectUser = React.useCallback(
    (user: DropzoneUserEssentialsFragment) => {
      dispatch(actions.forms.manifest.setField(['load', load]));
      dispatch(
        actions.forms.manifest.setOpen({
          dropzoneUser: user,
        } as never)
      );
    },
    [dispatch, load]
  );

  return (
    <DroppableSlot loadId={load?.id?.toString() || '0'} rowIndex={index}>
      <DataTable.Row testID="slot-row">
        <DropzoneUserAutocomplete
          placeholder="- Available -"
          value={null}
          onChange={onSelectUser}
        />
      </DataTable.Row>
    </DroppableSlot>
  );
}

const styles = StyleSheet.create({
  slotText: {
    fontSize: 12,
  },
});
