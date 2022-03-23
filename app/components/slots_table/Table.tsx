import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import React from 'react';
import { StyleSheet } from 'react-native';
import { DataTable, Surface, Text } from 'react-native-paper';
import { slotAvailableFragment } from 'app/__fixtures__/slots.fixtures';
import UserRow, { SlotFields } from './UserRow';
import AvailableRow from './AvailableRow';

export interface ISlotsTableProps {
  load?: LoadDetailsFragment;
  loading?: boolean;
  slots: SlotDetailsFragment[];
  fields?: SlotFields[];
  onDeletePress(slot: SlotDetailsFragment): void;
  onSlotPress(slot: SlotDetailsFragment): void;
  onSlotGroupPress(slots: SlotDetailsFragment[]): void;
  onAvailableSlotPress(): void;
}
export default function SlotsTable(props: ISlotsTableProps) {
  const {
    load,
    slots,
    fields,
    onDeletePress,
    onAvailableSlotPress,
    onSlotGroupPress,
    onSlotPress,
  } = props;

  console.log(fields);
  const items = React.useMemo(
    () =>
      Array.from({ length: load?.maxSlots || 3 }).map((_, index) =>
        slots && slots.length > index ? slots[index] : slotAvailableFragment
      ),
    [load?.maxSlots, slots]
  );

  return (
    <Surface style={{ flexGrow: 1 }}>
      <DataTable>
        <DataTable.Header style={{ width: '100%' }}>
          <DataTable.Title>
            <Text style={styles.th}>Name</Text>
          </DataTable.Title>
          {fields?.includes(SlotFields.License) && (
            <DataTable.Title numeric>
              <Text style={styles.th}>License</Text>
            </DataTable.Title>
          )}
          {fields?.includes(SlotFields.Rig) && (
            <DataTable.Title numeric>
              <Text style={styles.th}>Equipment</Text>
            </DataTable.Title>
          )}
          {fields?.includes(SlotFields.WingLoading) && (
            <DataTable.Title numeric>
              <Text style={styles.th}>Wing Loading</Text>
            </DataTable.Title>
          )}
          {!fields ||
            (fields?.includes(SlotFields.JumpType) && (
              <DataTable.Title numeric>
                <Text style={styles.th}>Jump type</Text>
              </DataTable.Title>
            ))}
          {fields?.includes(SlotFields.TicketType) && (
            <DataTable.Title numeric>
              <Text style={styles.th}>Ticket</Text>
            </DataTable.Title>
          )}
          {!fields ||
            (fields?.includes(SlotFields.Altitude) && (
              <DataTable.Title numeric>
                <Text style={styles.th}>Altitude</Text>
              </DataTable.Title>
            ))}
        </DataTable.Header>
        {load &&
          items?.map((slot, idx) =>
            slot.id === '__AVAILABLE__' ? (
              // eslint-disable-next-line react/no-array-index-key
              <AvailableRow {...{ onPress: onAvailableSlotPress }} key={`slot-available-${idx}`} />
            ) : (
              <UserRow
                {...{ fields, slot, load, onDeletePress, onSlotGroupPress, onSlotPress }}
                key={`slot-${slot.id}`}
              />
            )
          )}
      </DataTable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  th: {
    fontWeight: 'bold',
  },
});
