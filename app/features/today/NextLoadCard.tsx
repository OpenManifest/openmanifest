import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Countdown, Row, StatusBadge, Tappable, Text, useTheme } from 'app/ui';
import { LoadState } from 'app/api/schema.d';
import type { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { statusOf } from 'app/features/board/loadStatus';
import { placesOf } from 'app/features/board/places';

export type NextLoadCardProps = {
  load: LoadDetailsFragment;
  /** The member's own place on it */
  slot: SlotDetailsFragment;
  timeZone?: string | null;
  /** May take themselves off: the dropzone lets members change their own booking */
  canTakeOff?: boolean;
  /** The member must ask the desk: the dropzone does not let them take themselves off */
  deskOnly?: boolean;
  taking?: boolean;
  onTakeOff?(): void;
  onOpen?(): void;
  testID?: string;
};

/** The load the member flies next: its state and the call as the largest numeral, what they fly on it, and take-me-off */
export default function NextLoadCard({
  load,
  slot,
  timeZone,
  canTakeOff = false,
  deskOnly = false,
  taking = false,
  onTakeOff,
  onOpen,
  testID = 'today-next-load',
}: NextLoadCardProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const title = t('common:loadNumber', {
    load: t('terms:load', { count: 1 }),
    number: load.loadNumber,
  });
  const state = String(t(`terms:state.${load.state}`));
  const calling = load.state === LoadState.Boarding && !!load.dispatchAt;
  const { capacity, filled } = placesOf(load);
  const details = [slot.activityType?.name, slot.ticketType?.name].filter(Boolean).join(' · ');
  const canLeave = load.state === LoadState.Open || load.state === LoadState.Boarding;

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.md,
        padding: theme.space.lg,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colour.brand,
      }}
    >
      <Text variant="label" tone="muted">
        {t('common:today.next.title')}
      </Text>
      <Tappable
        role="button"
        aria-label={`${title}, ${state}`}
        minTarget={false}
        onPress={onOpen}
        testID={`${testID}-open`}
        style={{ gap: theme.space.sm }}
      >
        <Row justify="between" align="start" gap="md">
          <View style={{ flex: 1, gap: theme.space.xs }}>
            <Text variant="title" role="heading" aria-level={2}>
              {title}
            </Text>
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
        {details ? <Text tone="muted">{details}</Text> : null}
        <Text variant="caption" tone="muted">
          {t('common:today.next.places', { filled, capacity })}
        </Text>
      </Tappable>
      {canLeave && canTakeOff ? (
        <Button
          variant="secondary"
          icon="account-remove-outline"
          label={t('common:today.next.takeOff')}
          loading={taking}
          testID={`${testID}-take-off`}
          onPress={onTakeOff}
        />
      ) : null}
      {canLeave && deskOnly ? (
        <Text variant="caption" tone="muted" testID={`${testID}-desk`}>
          {t('common:today.next.desk')}
        </Text>
      ) : null}
    </View>
  );
}
