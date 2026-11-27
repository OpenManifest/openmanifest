import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DailyLogLoadFragment, DailyLogSlotFragment } from 'app/api/operations';
import useTerms from 'app/i18n/useTerms';
import { Divider, Row, Text, useTheme } from 'app/ui';
import Section, { Fact } from 'app/features/profile/Section';

/** How to reach somebody: their phone and email, as far as they gave them */
export function contactOf(slot: Pick<DailyLogSlotFragment, 'phone' | 'email'>): string {
  return [slot.phone, slot.email].filter(Boolean).join(' · ');
}

function Person({ slot }: { slot: DailyLogSlotFragment }) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const contact = contactOf(slot);

  return (
    <View
      testID={`daily-log-person-${slot.id}`}
      style={{
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.sm,
        gap: theme.space.xs,
      }}
    >
      <Row justify="between" align="center" gap="md" wrap>
        <Text variant="label">{slot.name || ''}</Text>
        {slot.ticketType ? <Text tone="muted">{slot.ticketType}</Text> : null}
      </Row>
      {slot.escort ? (
        <Text tone="muted" variant="bodyCompact">
          {t('dailyLog.with', { escort: term('escort').toLowerCase(), name: slot.escort })}
        </Text>
      ) : null}
      <Text variant="bodyCompact" tone={contact ? 'default' : 'muted'}>
        {contact || t('dailyLog.noContact')}
      </Text>
      <Text variant="bodyCompact" tone={slot.emergencyContact ? 'default' : 'muted'}>
        {t('dailyLog.emergencyContactOf', {
          contact: slot.emergencyContact || t('dailyLog.noEmergencyContact'),
        })}
      </Text>
    </View>
  );
}

/**
 * A load of the guest list (boat and ground templates): where it went, its vehicle and crew, and everybody on it with
 * how to reach them and who to call for them; a guest is listed after the member they came with.
 */
export default function GuestListLoad({ load }: { load: DailyLogLoadFragment }) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const destinations = load.destinations ?? [];
  const slots = load.slots ?? [];

  return (
    <Section
      title={t('loadNumber', { load: term('load'), number: load.loadNumber })}
      testID={`daily-log-load-${load.id}`}
      list
    >
      <View style={{ paddingHorizontal: theme.space.lg, gap: theme.space.xs }}>
        <Fact
          label={term('vehicle')}
          value={
            load.vehicle
              ? [load.vehicle.name, load.vehicle.registration].filter(Boolean).join(' ')
              : t('dailyLog.noVehicle', { vehicle: term('vehicle').toLowerCase() })
          }
        />
        {destinations.length ? (
          <Fact label={term('destination', destinations.length)} value={destinations.join(', ')} />
        ) : null}
        {(load.crew ?? []).map((crew) => (
          <Fact
            key={`${crew.role}-${crew.id}`}
            label={crew.role || ''}
            value={crew.name || t('dailyLog.nobody')}
          />
        ))}
        <Fact
          label={term('member', 2)}
          value={String(slots.length)}
          testID={`daily-log-load-${load.id}-count`}
        />
      </View>
      <Divider />
      {slots.length ? (
        slots.map((slot) => <Person key={slot.id} slot={slot} />)
      ) : (
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <Text tone="muted">{t('dailyLog.nobodyOn', { load: term('load').toLowerCase() })}</Text>
        </View>
      )}
    </Section>
  );
}
