import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import { StyleSheet, View } from 'react-native';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import React from 'react';
import { Icon } from 'app/ui';
import { generateColor } from 'app/utils/generateColor';
import { isNumber } from 'lodash';
import { formatDestination } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import useTerms from 'app/i18n/useTerms';
import { canopySize } from 'app/features/skydiving/parachute';
import SwipeActions from '../layout/SwipeActions';
import UserAvatar from '../UserAvatar';
import DraggableWrapper from './DragAndDrop/DraggableRow';
import DroppableSlot from './DragAndDrop/DroppableSlot';
import { Cell, CellText, TableRow } from './Grid';

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
  const { t } = useTranslation('common');
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
              <TableRow
                testID="slot-row"
                label={slot?.membership?.user?.nickname || slot?.membership?.user?.name || ''}
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
              >
                <Cell style={styles.avatarCell}>
                  <UserAvatar
                    size={20}
                    name={slot?.membership?.user?.nickname || slot?.membership?.user?.name || ''}
                    image={slot?.membership?.user?.image}
                  />
                </Cell>
                <Cell style={styles.nameCell}>
                  <CellText>
                    {slot?.membership?.user?.nickname
                      ? slot?.membership?.user?.nickname
                      : slot?.membership?.user?.name}
                  </CellText>

                  {slot?.membership?.user?.nickname ? (
                    <CellText muted>{` (${slot?.membership?.user?.name})`}</CellText>
                  ) : null}
                  {slot?.prepaid ? (
                    <CellText
                      muted
                      testID="slot-prepaid"
                    >{` · ${t('legacy.slotsTable.prepaid')}`}</CellText>
                  ) : null}
                </Cell>
                {fields?.includes(SlotFields.CertificationLevel) ? (
                  <Cell numeric style={styles.certificationLevelCell}>
                    <CellText>{slot?.membership?.certificationLevel?.name}</CellText>
                  </Cell>
                ) : null}
                {fields?.includes(SlotFields.Equipment) ? (
                  <Cell numeric style={styles.equipmentCell}>
                    <CellText>
                      {slot?.equipment
                        ?.map((item) => {
                          const size = canopySize(item, units);
                          return `${item.make} ${item.model}${size ? ` w/ ${size}` : ''}`;
                        })
                        .join(', ') || null}
                    </CellText>
                  </Cell>
                ) : null}
                {fields?.includes(SlotFields.WingLoading) ? (
                  <Cell numeric style={styles.wingLoadingCell}>
                    <CellText>{slot?.wingLoading?.toFixed(2) || '-'}</CellText>
                  </Cell>
                ) : null}
                {!fields || fields.includes(SlotFields.ActivityType) ? (
                  <Cell numeric style={styles.activityTypeCell}>
                    <CellText>{slot?.activityType?.name}</CellText>
                  </Cell>
                ) : null}
                {fields?.includes(SlotFields.TicketType) ? (
                  <Cell numeric style={styles.ticketCell}>
                    <CellText>{slot?.ticketType?.name}</CellText>
                  </Cell>
                ) : null}
                {!fields || fields.includes(SlotFields.Altitude) ? (
                  <Cell numeric style={styles.altitudeCell}>
                    <CellText>
                      {formatDestination(slot?.destination ?? slot?.ticketType?.defaultDestination)}
                    </CellText>
                  </Cell>
                ) : null}
              </TableRow>

              {(slot?.guestSlots ?? []).map((guestSlot) => (
                <TableRow
                  key={`guest-${guestSlot.id}`}
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
                >
                  <Cell style={styles.avatarCell}>
                    <Icon name="parachute" size={20} tone="muted" />
                  </Cell>
                  <Cell style={styles.tandemGuestNameCell}>
                    <CellText bold>{`${term('guest')}: `}</CellText>
                    <CellText>{guestSlot.guest?.name}</CellText>
                  </Cell>
                  <Cell numeric style={styles.altitudeCell}>
                    <CellText>
                      {formatDestination(slot?.destination ?? slot?.ticketType?.defaultDestination)}
                    </CellText>
                  </Cell>
                </TableRow>
              ))}
            </SwipeActions>
          </View>
        )}
      </DraggableWrapper>
    </DroppableSlot>
  );
}

export const styles = StyleSheet.create({
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
