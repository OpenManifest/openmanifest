import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type {
  DailyLogCrewFragment,
  DailyLogLoadFragment,
  DailyLogVehicleFragment,
} from 'app/api/operations';
import { LoadVehicleRole } from 'app/api/schema.d';
import { vehicleKindName } from 'app/forms/vehicle/kinds';
import { formatTime } from 'app/i18n/format';
import useTerms from 'app/i18n/useTerms';
import { Divider, ListRow, Text, useTheme } from 'app/ui';
import Section, { Fact } from 'app/features/profile/Section';

/** "Pilot · Sunrise": a role per vehicle names the vehicle it was filled for when the load had several */
export function crewLabel(
  crew: Pick<DailyLogCrewFragment, 'role' | 'vehicle'>,
  severalVehicles: boolean
): string {
  return [crew.role, severalVehicles ? crew.vehicle : null].filter(Boolean).join(' · ');
}

/** "Sunrise HB-201": the vehicle's name and registration */
export function vehicleName(vehicle: Pick<DailyLogVehicleFragment, 'name' | 'registration'>) {
  return [vehicle.name, vehicle.registration].filter(Boolean).join(' ');
}

/** The vehicles of the load, the one that carried first; the single vehicle of an older log */
export function vehiclesOf(load: Pick<DailyLogLoadFragment, 'vehicle' | 'vehicles'>) {
  const vehicles = load.vehicles?.length ? load.vehicles : load.vehicle ? [load.vehicle] : [];
  return [...vehicles].sort(
    (a, b) =>
      Number(a.role === LoadVehicleRole.Support) - Number(b.role === LoadVehicleRole.Support)
  );
}

/**
 * A flight of the flight log (scenic flights, balloons): when it left and came back and how long it took, where it went,
 * its vehicles (a balloon and its chase vehicle), the crew of each, and who flew.
 */
export default function FlightLogLoad({
  load,
  timeZone,
}: {
  load: DailyLogLoadFragment;
  timeZone?: string | null;
}) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const theme = useTheme();
  const destinations = load.destinations ?? [];
  const slots = load.slots ?? [];
  const vehicles = vehiclesOf(load);
  const notYet = t('dailyLog.notYet');

  return (
    <Section
      title={[t('loadNumber', { load: term('load'), number: load.loadNumber }), load.name]
        .filter(Boolean)
        .join(' · ')}
      testID={`daily-log-load-${load.id}`}
      list
    >
      <View style={{ paddingHorizontal: theme.space.lg, gap: theme.space.xs }}>
        <Fact
          label={t('dailyLog.departed')}
          value={load.departedAt ? formatTime(load.departedAt, timeZone) : notYet}
          testID={`daily-log-load-${load.id}-departed`}
        />
        <Fact
          label={t('dailyLog.back')}
          value={load.completedAt ? formatTime(load.completedAt, timeZone) : notYet}
          testID={`daily-log-load-${load.id}-back`}
        />
        <Fact
          label={t('dailyLog.duration')}
          value={
            load.durationMinutes != null
              ? t('dailyLog.minutes', { count: load.durationMinutes })
              : notYet
          }
          testID={`daily-log-load-${load.id}-duration`}
        />
        {destinations.length ? (
          <Fact label={term('destination', destinations.length)} value={destinations.join(', ')} />
        ) : null}
        {vehicles.length ? (
          vehicles.map((vehicle) => (
            <Fact
              key={vehicle.id}
              label={vehicle.kind ? vehicleKindName(vehicle.kind) : term('vehicle')}
              value={vehicleName(vehicle)}
            />
          ))
        ) : (
          <Fact
            label={term('vehicle')}
            value={t('dailyLog.noVehicle', { vehicle: term('vehicle').toLowerCase() })}
          />
        )}
        {(load.crew ?? []).map((crew) => (
          <Fact
            key={`${crew.role}-${crew.vehicle}-${crew.id}`}
            label={crewLabel(crew, vehicles.length > 1)}
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
        slots.map((slot) => (
          <ListRow
            key={slot.id}
            testID={`daily-log-slot-${slot.id}`}
            title={slot.name || ''}
            supporting={
              slot.escort
                ? t('dailyLog.with', { escort: term('escort').toLowerCase(), name: slot.escort })
                : undefined
            }
            trailing={slot.ticketType ? <Text tone="muted">{slot.ticketType}</Text> : undefined}
          />
        ))
      ) : (
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <Text tone="muted">{t('dailyLog.nobodyOn', { load: term('load').toLowerCase() })}</Text>
        </View>
      )}
    </Section>
  );
}
