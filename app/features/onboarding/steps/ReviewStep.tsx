import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useTicketTypesQuery } from 'app/api/reflection';
import { Button, Card, NumberField, Skeleton, Stack, Subheader, Text, TextField } from 'app/ui';
import PresetSummary from './PresetSummary';
import type { StepProps } from './types';

/** Cents in a unit of money */
const CENTS = 100;

type Props = StepProps & {
  /** Opens Setup → Rules, where the optional modules are switched on and off */
  onOpenRules(): void;
};

/**
 * What the operator starts with (the template's presets), the prices of its preset tickets, and its first vehicle.
 * The operator exists by now; what is entered here is saved when the owner goes on.
 */
export default function ReviewStep({ values, set, errors, industry, onOpenRules }: Props) {
  const { t } = useTranslation(['common', 'terms']);
  const { data, loading } = useTicketTypesQuery({
    variables: { operator: values.id as string },
    skip: !values.id,
  });
  const tickets = data?.ticketTypes ?? [];
  const words = {
    vehicle: t('terms:vehicle').toLowerCase(),
    tickets: t('terms:ticket', { count: 2 }).toLowerCase(),
  };

  return (
    <Stack gap="lg">
      {industry ? (
        <Card testID="review-presets">
          <PresetSummary industry={industry} />
        </Card>
      ) : null}

      <Stack gap="sm" testID="review-prices">
        <Subheader>{t('onboarding.prices')}</Subheader>
        {loading && !tickets.length ? <Skeleton lines={2} /> : null}
        {!loading && !tickets.length ? (
          <Text tone="muted">{t('onboarding.noTickets', words)}</Text>
        ) : null}
        {tickets.map((ticket) => (
          <NumberField
            key={ticket.id}
            testID={`review-price-${ticket.id}`}
            label={ticket.name ?? ''}
            unit={values.currency}
            min={0}
            value={
              ticket.id in values.prices
                ? values.prices[ticket.id]
                : (ticket.costCents ?? 0) / CENTS
            }
            onChange={(price) => set({ prices: { ...values.prices, [ticket.id]: price } })}
          />
        ))}
      </Stack>

      <Stack gap="sm" testID="review-vehicle">
        <Subheader>{t('onboarding.firstVehicle', words)}</Subheader>
        {values.vehicleId ? (
          <Text testID="review-vehicle-added">
            {t('onboarding.vehicleAdded', { name: values.vehicleName })}
          </Text>
        ) : (
          <>
            <Text tone="muted">{t('onboarding.firstVehicleHelp', words)}</Text>
            <TextField
              testID="review-vehicle-name"
              label={t('onboarding.vehicleName')}
              value={values.vehicleName}
              onChange={(vehicleName) => set({ vehicleName })}
            />
            <NumberField
              testID="review-vehicle-capacity"
              label={t('onboarding.vehicleCapacity')}
              min={1}
              value={values.vehicleCapacity}
              error={errors.vehicleCapacity}
              onChange={(vehicleCapacity) => set({ vehicleCapacity })}
            />
          </>
        )}
      </Stack>

      <Stack gap="xs">
        <Text tone="muted">{t('onboarding.modulesHelp')}</Text>
        <Button
          testID="review-open-rules"
          label={t('onboarding.openRules')}
          icon="tune-variant"
          variant="secondary"
          onPress={onOpenRules}
        />
      </Stack>
    </Stack>
  );
}
