import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Countdown, Row, StatusBadge, Text, useTheme } from 'app/ui';
import { LoadState } from 'app/api/schema.d';
import type {
  CrewRoleEssentialsFragment,
  LoadDetailsFragment,
  MembershipEssentialsFragment,
} from 'app/api/operations';
import { formatTime } from 'app/i18n/format';
import DestinationLabel from 'app/features/board/DestinationLabel';
import PlacesMeter from 'app/features/board/PlacesMeter';
import { crewSlots } from 'app/features/board/crew';
import { statusOf } from 'app/features/board/loadStatus';
import CrewRoleMenu from './CrewRoleMenu';

export type LoadHeaderProps = {
  load: LoadDetailsFragment;
  crewRoles?: readonly CrewRoleEssentialsFragment[];
  timeZone?: string | null;
  /** Fills a crew role; absent for someone who may not change the load */
  onFillRole?(
    role: { id: string },
    member: MembershipEssentialsFragment,
    loadVehicleId: string | null
  ): void;
  /** The next action of the load (a button), shown here beside the call when the screen is wide */
  action?: React.ReactNode;
  testID?: string;
};

/**
 * The top of the load screen: the call card (the countdown as its largest numeral and when the call was made, or when
 * the load left), where it goes, how full it is and who fills each crew role.
 */
export default function LoadHeader({
  load,
  crewRoles = [],
  timeZone,
  onFillRole,
  action,
  testID = 'load-header',
}: LoadHeaderProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const state = String(t(`terms:state.${load.state}`));
  const calling = load.state === LoadState.Boarding && !!load.dispatchAt;
  const callTerm = String(t('terms:call', { count: 1 }));
  const departed = load.departedAt ? formatTime(load.departedAt, timeZone) : null;
  const called = load.calledAt ? formatTime(load.calledAt, timeZone) : null;
  const crew = crewSlots(load, crewRoles);

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.md,
        padding: theme.space.lg,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
      }}
    >
      <Row justify="between" align="start" gap="md">
        <View style={{ flex: 1, gap: theme.space.xs }}>
          <Text variant="title" role="heading" aria-level={2}>
            {t('common:loadNumber', {
              load: t('terms:load', { count: 1 }),
              number: load.loadNumber,
            })}
          </Text>
          {load.name ? (
            <Text tone="muted" variant="bodyCompact">
              {load.name}
            </Text>
          ) : null}
          <StatusBadge status={statusOf(load.state)} label={state} testID={`${testID}-state`} />
          {called && load.state === LoadState.Boarding ? (
            <Text variant="caption" tone="muted" testID={`${testID}-called-at`}>
              {t('common:load.calledAt', { call: callTerm.toLowerCase(), time: called })}
            </Text>
          ) : null}
          {departed && [LoadState.Departed, LoadState.Completed].includes(load.state) ? (
            <Text variant="caption" tone="muted" testID={`${testID}-departed-at`}>
              {t('common:load.departedAt', { time: departed })}
            </Text>
          ) : null}
        </View>
        {calling ? (
          <Countdown
            end={load.dispatchAt as number}
            label={callTerm}
            timeZone={timeZone}
            testID={`${testID}-countdown`}
          />
        ) : null}
      </Row>

      <DestinationLabel destinations={load.destinations} testID={`${testID}-destinations`} />
      <PlacesMeter load={load} testID={`${testID}-places`} />

      {crew.length ? (
        <Row gap="xs" wrap>
          {crew.map((entry) => (
            <CrewRoleMenu
              key={entry.key}
              crew={entry}
              onSelect={
                onFillRole
                  ? (member) => onFillRole(entry.role, member, entry.loadVehicleId)
                  : undefined
              }
            />
          ))}
        </Row>
      ) : null}

      {action ? <View>{action}</View> : null}
    </View>
  );
}
