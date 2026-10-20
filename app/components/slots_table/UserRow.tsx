import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import { StyleSheet, Text, View } from 'react-native';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import React from 'react';
import { Avatar, Caption, DataTable, Paragraph } from 'react-native-paper';
import { generateColor } from 'app/utils/generateColor';
import { isNumber } from 'lodash';
import { formatDestination } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import useTerms from 'app/i18n/useTerms';
import { canopySize } from 'app/features/skydiving/rig';
import SwipeActions from '../layout/SwipeActions';
import UserAvatar from '../UserAvatar';
import DraggableWrapper from './DragAndDrop/DraggableRow';
import DroppableSlot from './DragAndDrop/DroppableSlot';

export enum SlotFields {
  CertificationLevel = 'certificationLevel',
  Group = 'groupNumber',
  WingLoading = 'wingloading',
  Altitude = 'altitude',
  Equipment = 'equipment',
  TicketType = 'ticketType',
  ActivityType = 'activityType',
}

export interface ISlotUserRowProps {
  load: LoadDetailsFragment;
  fields?: SlotFields[];
  slot: SlotDetailsFragment;
  index: number;
  onDeletePress(slot: SlotDetailsFragment): void;
  onSlotPress(slot: SlotDetailsFragment): void;
  onSlotGroupPress(slots: SlotDetailsFragment[]): void;
}

export const GROUP_COLORS = Array.from({ length: 20 }).map(() => generateColor());

export default function UserRow(props: ISlotUserRowProps) {
  const { fields, load, slot, index, onDeletePress, onSlotGroupPress, onSlotPress } = props;

  const { operator: currentOperator } = useOperatorContext();
  const units = useOperatorFormat((state) => state.units);
  const term = useTerms();
  const { currentUser } = currentOperator;
  const canEditSelf = useRestriction(Permission.UpdateSlot);
  const canEditOthers = useRestriction(Permission.UpdateUserSlot);

  const canRemoveSelf = useRestriction(Permission.DeleteSlot);
  const canRemoveOthers = useRestriction(Permission.DeleteUserSlot);

  const slotGroup: Required<(typeof load)['slots']> = load?.slots?.filter(
    ({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber
  ) as Required<(typeof load)['slots']>;
  const isCurrentUser = slot?.membership?.id === currentUser?.id;

  return (
    <DroppableSlot loadId={load.id} slotId={slot?.id} rowIndex={index}>
      <DraggableWrapper rowProps={props}>
        {({ isDragging }) => (
          <View style={{ minHeight: 46 }}>
            <SwipeActions
              disabled={
                isDragging ||
                (isCurrentUser && !canRemoveSelf) ||
                (!isCurrentUser && !canRemoveOthers)
              }
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
                disabled={!!load?.hasCompleted}
                onPress={() => {
                  if (slot.membership?.id === currentUser?.id) {
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
                    name={slot?.membership?.user?.nickname || slot?.membership?.user?.name || ''}
                    image={slot?.membership?.user?.image}
                    style={{ marginLeft: -12 }}
                  />
                </DataTable.Cell>
                <DataTable.Cell style={styles.nameCell}>
                  <Paragraph style={styles.slotText}>
                    {slot?.membership?.user?.nickname
                      ? slot?.membership?.user?.nickname
                      : slot?.membership?.user?.name}
                  </Paragraph>

                  {slot?.membership?.user?.nickname ? (
                    <Caption>{`(${slot?.membership?.user?.name})`}</Caption>
                  ) : null}
                  {slot?.prepaid ? <Caption testID="slot-prepaid"> · prepaid</Caption> : null}
                </DataTable.Cell>
                {fields?.includes(SlotFields.CertificationLevel) ? (
                  <DataTable.Cell numeric style={styles.certificationLevelCell}>
                    <Paragraph style={styles.slotText}>
                      {slot?.membership?.certificationLevel?.name}
                    </Paragraph>
                  </DataTable.Cell>
                ) : null}
                {fields?.includes(SlotFields.Equipment) ? (
                  <DataTable.Cell numeric style={styles.equipmentCell}>
                    <Paragraph style={styles.slotText}>
                      {slot?.equipment
                        ?.map((item) => {
                          const size = canopySize(item, units);
                          return `${item.make} ${item.model}${size ? ` w/ ${size}` : ''}`;
                        })
                        .join(', ') || null}
                    </Paragraph>
                  </DataTable.Cell>
                ) : null}
                {fields?.includes(SlotFields.WingLoading) ? (
                  <DataTable.Cell numeric style={styles.wingLoadingCell}>
                    <Paragraph style={styles.slotText}>
                      {slot?.wingLoading?.toFixed(2) || '-'}
                    </Paragraph>
                  </DataTable.Cell>
                ) : null}
                {!fields || fields.includes(SlotFields.ActivityType) ? (
                  <DataTable.Cell numeric style={styles.activityTypeCell}>
                    <Paragraph style={styles.slotText}>{slot?.activityType?.name}</Paragraph>
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
                      {formatDestination(slot?.destination ?? slot?.ticketType?.defaultDestination)}
                    </Paragraph>
                  </DataTable.Cell>
                ) : null}
              </DataTable.Row>

              {(slot?.guestSlots ?? []).map((guestSlot) => (
                <DataTable.Row
                  key={`guest-${guestSlot.id}`}
                  testID="slot-row"
                  disabled={!!load?.hasCompleted}
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
                  <DataTable.Cell style={styles.tandemGuestNameCell}>
                    <Paragraph style={styles.slotText}>
                      <Text style={{ fontWeight: 'bold' }}>{term('guest')}:</Text>{' '}
                      {guestSlot.guest?.name}
                    </Paragraph>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={styles.altitudeCell}>
                    <Paragraph style={styles.slotText}>
                      {formatDestination(slot?.destination ?? slot?.ticketType?.defaultDestination)}
                    </Paragraph>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </SwipeActions>
          </View>
        )}
      </DraggableWrapper>
    </DroppableSlot>
  );
}

export const styles = StyleSheet.create({
  slotText: {
    fontSize: 12,
    alignSelf: 'center',
    minHeight: 24,
    textAlignVertical: 'center',
  },
  avatarCell: {
    flex: 1,
  },
  certificationLevelCell: {
    flex: 3,
  },
  equipmentCell: {
    flex: 3,
  },
  wingLoadingCell: {
    flex: 3,
  },
  activityTypeCell: {
    flex: 3,
  },
  altitudeCell: {
    flex: 3,
  },
  nameCell: {
    flex: 6,
  },
  tandemGuestNameCell: {
    flexGrow: 20,
  },
  tandemInfoCell: {
    flex: 1,
  },
  ticketCell: {
    flex: 3,
  },
});
