import * as React from 'react';
import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import SlotsTable, { ISlotsTableProps } from 'app/components/slots_table/Table';
import { slotLoadingFragment } from 'app/__fixtures__/slots.fixtures';
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

  const slots: SlotDetailsFragment[] = Array.from({
    length: (load?.slots?.length || 0) + (load?.availableSlots || 0),
  }).map((_, index) =>
    (load?.slots?.length || 0) > index
      ? (load?.slots as SlotDetailsFragment[])[index]
      : { ...slotLoadingFragment, id: '__AVAILABLE__' }
  );

  console.log({ width, numFields, slots, load });

  return (
    <SlotsTable
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
        slots,
        onAvailableSlotPress,
        onDeletePress,
        onSlotGroupPress,
        onSlotPress,
      }}
    />
  );
}
