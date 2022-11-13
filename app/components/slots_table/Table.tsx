import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import React from 'react';
import { StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { DataTable, Surface, Text } from 'react-native-paper';
import UserRow, { SlotFields, styles as rowStyles } from './UserRow';
import AvailableRow from './AvailableRow';

export interface ISlotsTableProps {
  load?: LoadDetailsFragment | null;
  loading?: boolean;
  fields?: SlotFields[];
  onDeletePress(slot: SlotDetailsFragment): void;
  onSlotPress(slot: SlotDetailsFragment): void;
  onSlotGroupPress(slots: SlotDetailsFragment[]): void;
  onAvailableSlotPress(): void;
}
export default function SlotsTable(props: ISlotsTableProps) {
  const { load, fields, onDeletePress, onAvailableSlotPress, onSlotGroupPress, onSlotPress } =
    props;

  console.log(fields);

  return (
    <Surface style={{ height: '100%' }}>
      <DataTable style={{ height: '100%', paddingBottom: 80 }}>
        <DataTable.Header style={{ width: '100%' }}>
          <DataTable.Title style={rowStyles.avatarCell}>{null}</DataTable.Title>
          <DataTable.Title style={rowStyles.nameCell}>
            <Text style={styles.th}>Name</Text>
          </DataTable.Title>
          {fields?.includes(SlotFields.License) && (
            <DataTable.Title numeric style={rowStyles.licenseCell}>
              <Text style={styles.th}>License</Text>
            </DataTable.Title>
          )}
          {fields?.includes(SlotFields.Rig) && (
            <DataTable.Title numeric style={rowStyles.rigCell}>
              <Text style={styles.th}>Equipment</Text>
            </DataTable.Title>
          )}
          {fields?.includes(SlotFields.WingLoading) && (
            <DataTable.Title numeric style={rowStyles.wingLoadingCell}>
              <Text style={styles.th}>Wing Loading</Text>
            </DataTable.Title>
          )}
          {!fields ||
            (fields?.includes(SlotFields.JumpType) && (
              <DataTable.Title numeric style={rowStyles.jumpTypeCell}>
                <Text style={styles.th}>Jump type</Text>
              </DataTable.Title>
            ))}
          {fields?.includes(SlotFields.TicketType) && (
            <DataTable.Title numeric style={rowStyles.ticketCell}>
              <Text style={styles.th}>Ticket</Text>
            </DataTable.Title>
          )}
          {!fields ||
            (fields?.includes(SlotFields.Altitude) && (
              <DataTable.Title numeric style={rowStyles.altitudeCell}>
                <Text style={styles.th}>Altitude</Text>
              </DataTable.Title>
            ))}
        </DataTable.Header>
        <FlatList
          data={Array.from({ length: load?.maxSlots || 0 })?.map(
            (_, index) => load?.slots?.[index] || null
          )}
          keyExtractor={(item, index) => item?.id || `available-${index}`}
          renderItem={({ item: slot, index }) =>
            !slot || !load ? (
              <AvailableRow
                {...{ onPress: onAvailableSlotPress }}
                // eslint-disable-next-line react/no-array-index-key
                key={`slot-available-${index}`}
                index={index}
              />
            ) : (
              <UserRow
                {...{ fields, slot, load, onDeletePress, onSlotGroupPress, onSlotPress, index }}
                key={`slot-${slot.id}`}
              />
            )
          }
        />
      </DataTable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  th: {
    fontWeight: 'bold',
  },
});
