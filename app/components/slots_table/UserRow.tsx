import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import { StyleSheet } from 'react-native';
import useRestriction from 'app/hooks/useRestriction';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import React from 'react';
import { Caption, DataTable, Paragraph } from 'react-native-paper';
import { generateColor } from 'app/utils/generateColor';
import { isNumber } from 'lodash';
import SwipeActions from '../layout/SwipeActions';
import UserAvatar from '../UserAvatar';

export enum SlotFields {
  License = 'license',
  Group = 'groupNumber',
  WingLoading = 'wingloading',
  Altitude = 'altitude',
  Rig = 'rig',
  TicketType = 'ticketType',
  JumpType = 'ticketType',
}

export interface ISlotsTableProps {
  load: LoadDetailsFragment;
  fields?: SlotFields[];
  slot: SlotDetailsFragment;
  onDeletePress(slot: SlotDetailsFragment): void;
  onSlotPress(slot: SlotDetailsFragment): void;
  onSlotGroupPress(slots: SlotDetailsFragment[]): void;
}

const GROUP_COLORS = Array.from({ length: 20 }).map(() => generateColor());

export default function UserRow(props: ISlotsTableProps) {
  const { fields, load, slot, onDeletePress, onSlotGroupPress, onSlotPress } = props;

  const currentDropzone = useCurrentDropzone();
  const { currentUser } = currentDropzone;
  const canEditSelf = useRestriction(Permission.UpdateSlot);
  const canEditOthers = useRestriction(Permission.UpdateUserSlot);

  const canRemoveSelf = useRestriction(Permission.DeleteSlot);
  const canRemoveOthers = useRestriction(Permission.DeleteUserSlot);

  const slotGroup: Required<typeof load['slots']> = load?.slots?.filter(
    ({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber
  ) as Required<typeof load['slots']>;
  const isCurrentUser = slot?.dropzoneUser?.id === currentUser?.id;

  return (
    <SwipeActions
      disabled={(isCurrentUser && !canRemoveSelf) || (!isCurrentUser && !canRemoveOthers)}
      key={`slot-${slot.id}`}
      rightAction={{
        label: 'Delete',
        backgroundColor: 'red',
        onPress: () => onDeletePress(slot),
      }}
    >
      <DataTable.Row
        testID="slot-row"
        style={
          isNumber(slot?.groupNumber)
            ? {
                borderLeftWidth: 5,
                borderLeftColor: GROUP_COLORS[slot.groupNumber % 20],
                paddingLeft: 4,
              }
            : undefined
        }
        disabled={!!load?.hasLanded}
        onPress={() => {
          if (slot.dropzoneUser?.id === currentUser?.id) {
            if (canEditSelf) {
              if (slotGroup?.length) {
                onSlotGroupPress(slotGroup);
              } else {
                onSlotPress(slot);
              }
            }
          } else if (canEditOthers) {
            if (slotGroup?.length) {
              onSlotGroupPress(slotGroup);
            } else {
              onSlotPress(slot);
            }
          }
        }}
        pointerEvents="none"
      >
        <DataTable.Cell
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            marginLeft: 0,
            flexWrap: 'nowrap',
            alignItems: 'center',
          }}
        >
          <UserAvatar
            size={20}
            name={slot?.dropzoneUser?.user?.nickname || slot?.dropzoneUser?.user?.name || ''}
            source={
              slot?.dropzoneUser?.user?.image ? { uri: slot?.dropzoneUser?.user?.image } : undefined
            }
            style={{ marginLeft: -12 }}
          />
          <Paragraph style={styles.slotText}>
            {slot?.dropzoneUser?.user?.nickname
              ? slot?.dropzoneUser?.user?.nickname
              : slot?.dropzoneUser?.user?.name}
          </Paragraph>

          {slot?.dropzoneUser?.user?.nickname ? (
            <Caption>{`(${slot?.dropzoneUser?.user?.name})`}</Caption>
          ) : null}
        </DataTable.Cell>
        {fields?.includes(SlotFields.License) ? (
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>{slot?.dropzoneUser?.license?.name}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {fields?.includes(SlotFields.Rig) ? (
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>
              {slot?.rig ? `${slot.rig.make} ${slot.rig.model} w/ ${slot.rig.canopySize}` : null}
            </Paragraph>
          </DataTable.Cell>
        ) : null}
        {fields?.includes(SlotFields.WingLoading) ? (
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>{slot?.wingLoading?.toFixed(2) || '-'}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {!fields || fields.includes(SlotFields.JumpType) ? (
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>{slot?.jumpType?.name}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {fields?.includes(SlotFields.TicketType) ? (
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>{slot?.ticketType?.name}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {!fields || fields.includes(SlotFields.Altitude) ? (
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>
              {(slot?.ticketType?.altitude || 14000) / 1000}k
            </Paragraph>
          </DataTable.Cell>
        ) : null}
      </DataTable.Row>

      {slot?.ticketType?.isTandem && (
        <DataTable.Row testID="slot-row" disabled={!!load?.hasLanded} pointerEvents="none">
          <DataTable.Cell>
            <Paragraph style={styles.slotText}>{slot?.passengerName}</Paragraph>
          </DataTable.Cell>
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>Passenger</Paragraph>
          </DataTable.Cell>
          <DataTable.Cell numeric>
            <Paragraph style={styles.slotText}>
              {(slot?.ticketType?.altitude || 14000) / 1000}k
            </Paragraph>
          </DataTable.Cell>
        </DataTable.Row>
      )}
    </SwipeActions>
  );
}

const styles = StyleSheet.create({
  slotText: {
    fontSize: 12,
    alignSelf: 'center',
    height: 24,
    textAlignVertical: 'center',
  },
});
