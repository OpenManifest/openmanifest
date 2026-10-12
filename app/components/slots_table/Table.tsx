import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LoadVehicleRole } from 'app/api/schema.d';
import { FlatList } from 'react-native-gesture-handler';
import { DataTable, Surface, Text } from 'react-native-paper';
import UserRow, { SlotFields, styles as rowStyles } from './UserRow';
import AvailableRow from './AvailableRow';
import useTerms from 'app/i18n/useTerms';

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

type SlotEntry =
  | { kind: 'slot'; key: string; slot: SlotDetailsFragment | null; index: number }
  | { kind: 'group'; key: string; title: string; seats: string };

/**
 * One entry per slot of the load: the jumper, or null for a free slot. A load with several vehicles that carry shows its
 * slots in groups, one per vehicle (with the seats taken), and the ones that ride in none after them.
 */
export function buildSlotEntries(
  load: LoadDetailsFragment | null | undefined,
  labels: { seats(count: number, seats: number): string; notAssigned: string }
): SlotEntry[] {
  const slots = load?.slots ?? [];
  const carrying = (load?.vehicles ?? []).filter(({ role }) => role === LoadVehicleRole.Carrying);
  if (carrying.length < 2) {
    return Array.from({ length: load?.maxSlots || 0 }).map((_, index) => {
      const slot = slots[index] || null;
      return { kind: 'slot', key: slot?.id || `available-${index}`, slot, index };
    });
  }

  const entries: SlotEntry[] = [];
  let free = Math.max(0, (load?.maxSlots || 0) - slots.length);
  let index = 0;
  const assigned = new Set<string>();
  carrying.forEach((loadVehicle) => {
    const inVehicle = slots.filter((slot) => slot.loadVehicle?.id === loadVehicle.id);
    inVehicle.forEach((slot) => assigned.add(slot.id));
    entries.push({
      kind: 'group',
      key: `group-${loadVehicle.id}`,
      title: loadVehicle.vehicle.name ?? loadVehicle.vehicle.registration ?? loadVehicle.id,
      seats: labels.seats(inVehicle.length, loadVehicle.capacity),
    });
    inVehicle.forEach((slot) => entries.push({ kind: 'slot', key: slot.id, slot, index: index++ }));
    const open = Math.min(free, Math.max(0, loadVehicle.capacity - inVehicle.length));
    free -= open;
    for (let n = 0; n < open; n += 1) {
      entries.push({
        kind: 'slot',
        key: `available-${loadVehicle.id}-${n}`,
        slot: null,
        index: index++,
      });
    }
  });
  const rest = slots.filter((slot) => !assigned.has(slot.id));
  if (rest.length) {
    entries.push({
      kind: 'group',
      key: 'group-none',
      title: labels.notAssigned,
      seats: String(rest.length),
    });
    rest.forEach((slot) => entries.push({ kind: 'slot', key: slot.id, slot, index: index++ }));
  }
  return entries;
}

function useSlotEntries(load?: LoadDetailsFragment | null) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const vehicle = term('vehicle').toLowerCase();
  return React.useMemo(
    () =>
      buildSlotEntries(load, {
        seats: (count, seats) => t('forms.load.groupSeats', { count, seats }),
        notAssigned: t('forms.load.notAssigned', { vehicle }),
      }),
    [load, t, vehicle]
  );
}

function GroupHeader({ title, seats, id }: { title: string; seats: string; id: string }) {
  return (
    <View style={styles.group} testID={`slots-${id}`}>
      <Text style={styles.th} role="heading" aria-level={3}>
        {title}
      </Text>
      <Text>{seats}</Text>
    </View>
  );
}

function ColumnHeadings({ fields }: Pick<ISlotsTableProps, 'fields'>) {
  const term = useTerms();
  return (
    <DataTable.Header style={styles.headings}>
      <DataTable.Title style={rowStyles.avatarCell}>{null}</DataTable.Title>
      <DataTable.Title style={rowStyles.nameCell}>
        <Text style={styles.th}>Name</Text>
      </DataTable.Title>
      {fields?.includes(SlotFields.CertificationLevel) && (
        <DataTable.Title numeric style={rowStyles.certificationLevelCell}>
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
        (fields?.includes(SlotFields.ActivityType) && (
          <DataTable.Title numeric style={rowStyles.activityTypeCell}>
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
            <Text style={styles.th}>{term('destination')}</Text>
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
        {entries.map((entry) =>
          entry.kind === 'group' ? (
            <GroupHeader key={entry.key} id={entry.key} title={entry.title} seats={entry.seats} />
          ) : (
            <SlotRow {...props} key={entry.key} slot={entry.slot} index={entry.index} />
          )
        )}
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
      keyExtractor={(entry) => entry.key}
      ListHeaderComponent={heading}
      renderItem={({ item: entry }) =>
        entry.kind === 'group' ? (
          <GroupHeader id={entry.key} title={entry.title} seats={entry.seats} />
        ) : (
          <SlotRow {...props} slot={entry.slot} index={entry.index} />
        )
      }
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
  group: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    // Room for the floating action button below the last row
    paddingBottom: 96,
  },
});
