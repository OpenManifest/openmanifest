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

export interface ISlotsListProps extends ISlotsTableProps {
  /** Rendered above the column headings, scrolling with the rows */
  ListHeaderComponent?: React.ReactElement | null;
}

/** One entry per slot of the load: the jumper, or null for a free slot */
function useSlotEntries(load?: LoadDetailsFragment | null) {
  return React.useMemo(
    () =>
      Array.from({ length: load?.maxSlots || 0 }).map(
        (_, index) => load?.slots?.[index] || null
      ) as (SlotDetailsFragment | null)[],
    [load?.maxSlots, load?.slots]
  );
}

function ColumnHeadings({ fields }: Pick<ISlotsTableProps, 'fields'>) {
  return (
    <DataTable.Header style={styles.headings}>
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
  );
}

function SlotRow(props: ISlotsTableProps & { slot: SlotDetailsFragment | null; index: number }) {
  const { slot, index, load, fields, ...handlers } = props;
  const { onDeletePress, onSlotGroupPress, onSlotPress, onAvailableSlotPress } = handlers;

  return !slot || !load ? (
    <AvailableRow {...{ onPress: onAvailableSlotPress }} index={index} />
  ) : (
    <UserRow {...{ fields, slot, load, onDeletePress, onSlotGroupPress, onSlotPress, index }} />
  );
}

/**
 * Column headings and one row per slot, laid out in place (no scrolling of its own): for tables inside cards and other
 * content that scrolls.
 */
export default function SlotsTable(props: ISlotsTableProps) {
  const { load, fields } = props;
  const entries = useSlotEntries(load);

  return (
    <Surface>
      <DataTable>
        <ColumnHeadings {...{ fields }} />
        {entries.map((slot, index) => (
          <SlotRow {...props} key={slot?.id || `available-${index}`} {...{ slot, index }} />
        ))}
      </DataTable>
    </Surface>
  );
}

/** The slots as a list that is the scroll container of its screen, with the screen's header scrolling along */
export function SlotsList(props: ISlotsListProps) {
  const { load, fields, ListHeaderComponent } = props;
  const entries = useSlotEntries(load);
  const heading = React.useMemo(
    () => (
      <>
        {ListHeaderComponent}
        <ColumnHeadings {...{ fields }} />
      </>
    ),
    [ListHeaderComponent, fields]
  );

  return (
    <FlatList
      testID="slots"
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={entries}
      keyExtractor={(item, index) => item?.id || `available-${index}`}
      ListHeaderComponent={heading}
      renderItem={({ item: slot, index }) => <SlotRow {...props} {...{ slot, index }} />}
    />
  );
}

const styles = StyleSheet.create({
  th: {
    fontWeight: 'bold',
  },
  headings: {
    width: '100%',
  },
  list: {
    flex: 1,
  },
  listContent: {
    // Room for the floating action button below the last row
    paddingBottom: 96,
  },
});
