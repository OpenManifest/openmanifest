import * as React from 'react';
import { Platform, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Avatar, Icon, Menu, Row, StatusBadge, Tappable, Text, useTheme } from 'app/ui';
import type { StatusKey } from 'app/ui';
import type { EligibilityResultEssentialsFragment, SlotDetailsFragment } from 'app/api/operations';
import { formatDestination } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import EligibilityBadge from './EligibilityBadge';
import type { GroupPosition } from './sections';

/** The colours the groups of a load take in turn: a status colour is a pair that already reads in both schemes */
const GROUP_COLOURS: StatusKey[] = ['info', 'boarding', 'landed', 'departed'];

export type PlaceRowProps = {
  slot: SlotDetailsFragment;
  rules?: readonly EligibilityResultEssentialsFragment[] | null;
  group?: { number: number; position: GroupPosition } | null;
  /** May change this place (their own, or anyone's) */
  canEdit?: boolean;
  canTakeOff?: boolean;
  /** Whether the destination of the place is worth showing: when it can differ from the load's */
  showDestination?: boolean;
  /** The guests of an escort are shown under the row, so this row is joined to them */
  joined?: boolean;
  onEdit?(slot: SlotDetailsFragment): void;
  onTakeOff?(slot: SlotDetailsFragment): void;
  onOpenPerson?(slot: SlotDetailsFragment): void;
  testID?: string;
};

/**
 * A person on the load: photo, name, what they hold (certification, activity, ticket) and what to know about them at a
 * glance (not ready, prepaid), with a menu of what can be done. The people of a group have a coloured edge, joined from
 * the first to the last. On a phone the row also swipes to take the person off.
 */
export default function PlaceRow({
  slot,
  rules,
  group,
  canEdit = false,
  canTakeOff = false,
  showDestination = false,
  joined = false,
  onEdit,
  onTakeOff,
  onOpenPerson,
  testID = 'slot-row',
}: PlaceRowProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const units = useOperatorFormat((state) => state.units);
  const user = slot.membership?.user;
  const name = user?.nickname || user?.name || '';
  const details = [
    slot.membership?.certificationLevel?.name,
    slot.activityType?.name,
    slot.ticketType?.name,
  ].filter(Boolean);
  const destination = showDestination ? formatDestination(slot.destination, units) : '';
  const colour = group
    ? theme.colour.status[GROUP_COLOURS[group.number % GROUP_COLOURS.length]].fg
    : 'transparent';
  const first = !group || group.position === 'first' || group.position === 'only';
  const last = !group || group.position === 'last' || group.position === 'only';

  const items = [
    canEdit && onEdit
      ? {
          label: t('common:load.edit'),
          icon: 'pencil-outline' as const,
          testID: `${testID}-edit`,
          onPress: () => onEdit(slot),
        }
      : null,
    canTakeOff && onTakeOff
      ? {
          label: t('common:load.takeOff'),
          icon: 'account-remove-outline' as const,
          destructive: true,
          testID: `${testID}-take-off`,
          onPress: () => onTakeOff(slot),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => !!item);

  const row = (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
        paddingVertical: theme.space.sm,
        paddingRight: theme.space.sm,
        paddingLeft: theme.space.md,
        backgroundColor: theme.colour.surface,
        borderLeftWidth: 4,
        borderLeftColor: colour,
        borderTopLeftRadius: first ? theme.radius.md : 0,
        borderBottomLeftRadius: last && !joined ? theme.radius.md : 0,
      }}
    >
      <Tappable
        role="button"
        aria-label={name}
        minTarget={false}
        onPress={onOpenPerson ? () => onOpenPerson(slot) : undefined}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}
      >
        <Avatar name={name} imageUri={user?.image} size="sm" />
        <View style={{ flex: 1, gap: theme.space.xs }}>
          <Text variant="body" numberOfLines={1}>
            {name}
          </Text>
          {details.length ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {details.join(' · ')}
            </Text>
          ) : null}
          {destination ? (
            <Row gap="xs" align="center">
              <Icon name="map-marker-outline" size={14} tone="muted" />
              <Text variant="caption" tone="muted" testID={`${testID}-destination`}>
                {destination}
              </Text>
            </Row>
          ) : null}
          <Row gap="xs" wrap>
            <EligibilityBadge rules={rules} testID={`${testID}-eligibility`} />
            {slot.prepaid ? (
              <StatusBadge
                status="ok"
                icon="cash-check"
                label={t('common:load.prepaid')}
                testID={`${testID}-prepaid`}
              />
            ) : null}
          </Row>
        </View>
      </Tappable>
      {items.length ? (
        <Menu
          label={t('common:load.placeMenu', { name })}
          items={items}
          testID={`${testID}-menu`}
        />
      ) : null}
    </View>
  );

  // A phone swipes a row away as a shortcut; every place has the menu as well
  if (Platform.OS === 'web' || !canTakeOff || !onTakeOff) return row;
  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <Tappable
          role="button"
          aria-label={t('common:load.takeOff')}
          onPress={() => onTakeOff(slot)}
          style={{
            justifyContent: 'center',
            paddingHorizontal: theme.space.lg,
            backgroundColor: theme.colour.status.blocked.bg,
          }}
        >
          <Text tone="blocked">{t('common:load.takeOff')}</Text>
        </Tappable>
      )}
    >
      {row}
    </Swipeable>
  );
}
