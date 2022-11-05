import * as React from 'react';
import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import LoadSlotTable, { ISlotsTableProps } from 'app/components/slots_table/Table';
import { SlotFields } from 'app/components/slots_table/UserRow';
import { useWindowDimensions } from 'react-native';

interface ITableViewProps extends Omit<ISlotsTableProps, 'load'> {
  load?: LoadDetailsFragment | null;
  loading: boolean;
  refetch(): void;
  onSlotPress(slot: SlotDetailsFragment): void;
}

export default function LoadScreen(props: ITableViewProps) {
  const { load, loading, onAvailableSlotPress, onDeletePress, onSlotGroupPress, onSlotPress } =
    props;
  const { width } = useWindowDimensions();
  const numFields = Math.floor(width / 200);

  console.log({ width, numFields, load });

  return (
    <LoadSlotTable
      fields={
        [
          SlotFields.Altitude,
          SlotFields.JumpType,
          numFields > 2 ? SlotFields.License : null,
          numFields > 3 ? SlotFields.TicketType : null,
          numFields > 4 ? SlotFields.WingLoading : null,
          numFields > 5 ? SlotFields.Rig : null,
        ].filter(Boolean) as SlotFields[]
      }
      {...{
        load,
        loading,
        onAvailableSlotPress,
        onDeletePress,
        onSlotGroupPress,
        onSlotPress,
      }}
    />
  );
}
