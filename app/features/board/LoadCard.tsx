import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Countdown, Row, StatusBadge, Tappable, Text, useTheme } from 'app/ui';
import { LoadState } from 'app/api/schema.d';
import type { CrewRoleEssentialsFragment, LoadDetailsFragment } from 'app/api/operations';
import CrewChip from './CrewChip';
import DestinationLabel from './DestinationLabel';
import PlacesMeter from './PlacesMeter';
import VehicleIcon from './VehicleIcon';
import { crewSlots } from './crew';
import { isOver, statusOf } from './loadStatus';

export type LoadCardProps = {
  load: LoadDetailsFragment;
  /** The crew roles of the operator: the card shows who fills each, and flags a required role that is empty */
  crewRoles?: readonly CrewRoleEssentialsFragment[];
  /** The operator's time zone, for the clock time a screen reader hears */
  timeZone?: string | null;
  /** The load the board has open beside the list */
  selected?: boolean;
  /** A moment after the load changed */
  highlighted?: boolean;
  onPress?(): void;
  /** The next action of the load (a button), added by the board */
  action?: React.ReactNode;
  testID?: string;
};

/**
 * A load on the board: its state, the call countdown as the largest numeral, its vehicles, the places taken, who fills
 * each crew role and the next action. Press it to open the load.
 */
export default function LoadCard({
  load,
  crewRoles = [],
  timeZone,
  selected = false,
  highlighted = false,
  onPress,
  action,
  testID = 'load-card',
}: LoadCardProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const title = t('common:loadNumber', {
    load: t('terms:load', { count: 1 }),
    number: load.loadNumber,
  });
  const state = String(t(`terms:state.${load.state}`));
  const calling = load.state === LoadState.Boarding && !!load.dispatchAt;
  const vehicles = load.vehicles ?? [];
  const crew = crewSlots(load, crewRoles);

  return (
    <View
      testID={testID}
      style={{
        opacity: isOver(load.state) ? 0.7 : 1,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: selected || highlighted ? 2 : 1,
        borderColor: selected || highlighted ? theme.colour.brand : theme.colour.border,
        padding: theme.space.lg,
        gap: theme.space.md,
      }}
    >
      {/* The action is a button of its own, so it sits beside the pressable and not inside it */}
      <Tappable
        role="button"
        aria-label={`${title}, ${state}`}
        onPress={onPress}
        minTarget={false}
        testID={`${testID}-open`}
        style={{ gap: theme.space.md }}
      >
        <Row justify="between" align="start" gap="md">
          <View style={{ flex: 1, gap: theme.space.xs }}>
            <Text variant="title" role="heading" aria-level={3}>
              {title}
            </Text>
            {load.name ? (
              <Text tone="muted" variant="bodyCompact">
                {load.name}
              </Text>
            ) : null}
            <StatusBadge status={statusOf(load.state)} label={state} testID={`${testID}-state`} />
          </View>
          {calling ? (
            <Countdown
              end={load.dispatchAt as number}
              label={String(t('terms:call', { count: 1 }))}
              timeZone={timeZone}
              testID={`${testID}-countdown`}
            />
          ) : null}
        </Row>

        {vehicles.length ? (
          <Row gap="md" wrap>
            {vehicles.map(({ id, vehicle }) => (
              <Row key={id} gap="xs" align="center">
                <VehicleIcon kind={vehicle.kind} />
                <Text variant="bodyCompact">{vehicle.name}</Text>
              </Row>
            ))}
          </Row>
        ) : (
          <Text tone="muted" variant="bodyCompact">
            {t('common:board.noVehicle', {
              vehicle: t('terms:vehicle', { count: 1 }).toLowerCase(),
            })}
          </Text>
        )}

        <DestinationLabel destinations={load.destinations} testID={`${testID}-destinations`} />
        <PlacesMeter load={load} testID={`${testID}-places`} />

        {crew.length ? (
          <Row gap="xs" wrap>
            {crew.map(({ key, role, label, member }) => (
              <CrewChip key={key} role={role} label={label} member={member} />
            ))}
          </Row>
        ) : null}
      </Tappable>
      {action ? <View>{action}</View> : null}
    </View>
  );
}
