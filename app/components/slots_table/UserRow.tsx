import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import { StyleSheet, Text } from 'react-native';
import useRestriction from 'app/hooks/useRestriction';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import React from 'react';
import { Avatar, Caption, DataTable, Paragraph } from 'react-native-paper';
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

export const GROUP_COLORS = Array.from({ length: 20 }).map(() => generateColor());

export default function UserRow(props: ISlotsTableProps) {
  const { fields, load, slot, onDeletePress, onSlotGroupPress, onSlotPress } = props;

  const currentDropzone = useDropzoneContext();
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
          console.debug({ slotGroup });
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
        <DataTable.Cell style={styles.avatarCell}>
          <UserAvatar
            size={20}
            name={slot?.dropzoneUser?.user?.nickname || slot?.dropzoneUser?.user?.name || ''}
            source={
              slot?.dropzoneUser?.user?.image ? { uri: slot?.dropzoneUser?.user?.image } : undefined
            }
            style={{ marginLeft: -12 }}
          />
        </DataTable.Cell>
        <DataTable.Cell style={styles.nameCell}>
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
          <DataTable.Cell numeric style={styles.licenseCell}>
            <Paragraph style={styles.slotText}>{slot?.dropzoneUser?.license?.name}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {fields?.includes(SlotFields.Rig) ? (
          <DataTable.Cell numeric style={styles.rigCell}>
            <Paragraph style={styles.slotText}>
              {slot?.rig ? `${slot.rig.make} ${slot.rig.model} w/ ${slot.rig.canopySize}` : null}
            </Paragraph>
          </DataTable.Cell>
        ) : null}
        {fields?.includes(SlotFields.WingLoading) ? (
          <DataTable.Cell numeric style={styles.wingLoadingCell}>
            <Paragraph style={styles.slotText}>{slot?.wingLoading?.toFixed(2) || '-'}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {!fields || fields.includes(SlotFields.JumpType) ? (
          <DataTable.Cell numeric style={styles.jumpTypeCell}>
            <Paragraph style={styles.slotText}>{slot?.jumpType?.name}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {fields?.includes(SlotFields.TicketType) ? (
          <DataTable.Cell numeric style={styles.ticketCell}>
            <Paragraph style={styles.slotText}>{slot?.ticketType?.name}</Paragraph>
          </DataTable.Cell>
        ) : null}
        {!fields || fields.includes(SlotFields.Altitude) ? (
          <DataTable.Cell numeric style={styles.altitudeCell}>
            <Paragraph style={styles.slotText}>
              {(slot?.ticketType?.altitude || 14000) / 1000}k
            </Paragraph>
          </DataTable.Cell>
        ) : null}
      </DataTable.Row>

      {slot?.ticketType?.isTandem && (
        <DataTable.Row
          testID="slot-row"
          disabled={!!load?.hasLanded}
          pointerEvents="none"
          style={
            isNumber(slot?.groupNumber)
              ? {
                  borderLeftWidth: 5,
                  borderLeftColor: GROUP_COLORS[slot.groupNumber % 20],
                  paddingLeft: 4,
                }
              : undefined
          }
        >
          <DataTable.Cell style={styles.avatarCell}>
            <Avatar.Icon icon="parachute" size={20} />
          </DataTable.Cell>
          <DataTable.Cell style={styles.tandemPassengerNameCell}>
            <Paragraph style={styles.slotText}>
              <Text style={{ fontWeight: 'bold' }}>Tandem Passenger:</Text> {slot?.passengerName}
            </Paragraph>
          </DataTable.Cell>
          <DataTable.Cell numeric style={styles.altitudeCell}>
            <Paragraph style={styles.slotText}>
              {(slot?.ticketType?.altitude || 14000) / 1000}k
            </Paragraph>
          </DataTable.Cell>
        </DataTable.Row>
      )}
    </SwipeActions>
  );
}

export const styles = StyleSheet.create({
  slotText: {
    fontSize: 12,
    alignSelf: 'center',
    height: 24,
    textAlignVertical: 'center',
  },
  avatarCell: {
    flex: 1,
  },
  licenseCell: {
    flex: 3,
  },
  rigCell: {
    flex: 3,
  },
  wingLoadingCell: {
    flex: 3,
  },
  jumpTypeCell: {
    flex: 3,
  },
  altitudeCell: {
    flex: 3,
  },
  nameCell: {
    flex: 6,
  },
  tandemPassengerNameCell: {
    flexGrow: 20,
  },
  tandemInfoCell: {
    flex: 1,
  },
  ticketCell: {
    flex: 3,
  },
});
