import * as React from 'react';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import CertificationBodyChipSelect from 'app/components/input/chip_select/CertificationBodyChipSelect';
import { UNIT_CHOICES } from 'app/i18n/units';
import { Button, FieldError, Select, Stack, Text, TextField } from 'app/ui';
import { currencyChoices, unitQuantitiesOf } from '../wizard';
import type { StepProps } from './types';

/** Decimals of a coordinate shown (about 10 m) */
const COORDINATE_DIGITS = 4;

/** The operator's name */
export function NameStep({ values, set, errors }: StepProps) {
  const { t } = useTranslation(['common', 'terms']);
  return (
    <TextField
      testID="wizard-name"
      label={t('onboarding.name', { operator: t('terms:operator').toLowerCase() })}
      value={values.name}
      error={errors.name}
      onChange={(name) => set({ name })}
    />
  );
}

/** Where the operator is: its time zone (the device's to start with) and, if the owner wants, the device's position */
export function LocationStep({ values, set, errors }: StepProps) {
  const { t } = useTranslation(['common', 'terms']);
  const [locating, setLocating] = React.useState(false);
  const [denied, setDenied] = React.useState(false);

  const useMyLocation = React.useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDenied(true);
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      set({ lat: coords.latitude, lng: coords.longitude });
    } catch {
      setDenied(true);
    } finally {
      setLocating(false);
    }
  }, [set]);

  return (
    <Stack gap="md">
      <TextField
        testID="wizard-time-zone"
        label={t('onboarding.timeZone')}
        helperText={t('onboarding.timeZoneHelp')}
        value={values.timeZone}
        error={errors.timeZone}
        onChange={(timeZone) => set({ timeZone })}
      />
      <Stack gap="xs">
        <Text tone="muted">
          {values.lat !== null && values.lng !== null
            ? t('onboarding.position', {
                lat: values.lat.toFixed(COORDINATE_DIGITS),
                lng: values.lng.toFixed(COORDINATE_DIGITS),
              })
            : t('onboarding.noPosition', { operator: t('terms:operator').toLowerCase() })}
        </Text>
        <Button
          testID="wizard-my-location"
          label={t('onboarding.useMyLocation')}
          icon="crosshairs-gps"
          variant="secondary"
          loading={locating}
          onPress={useMyLocation}
        />
        {denied ? <FieldError>{t('onboarding.locationDenied')}</FieldError> : null}
      </Stack>
    </Stack>
  );
}

/** The money the operator sells in (the device's to start with) and the units of its template */
export function MoneyStep({ values, set, errors, industry }: StepProps) {
  const { t } = useTranslation('common');
  return (
    <Stack gap="md">
      <Select
        testID="wizard-currency"
        label={t('rules.currency')}
        helperText={t('rules.currencyHelp')}
        value={values.currency}
        error={errors.currency}
        options={currencyChoices(values.currency).map((code) => ({ value: code, label: code }))}
        onChange={(currency) => set({ currency })}
      />
      {unitQuantitiesOf(industry?.units).map((quantity) => (
        <Select
          key={quantity}
          testID={`wizard-unit-${quantity}`}
          label={t(`rules.unit.${quantity}`)}
          value={values.units[quantity] ?? null}
          options={UNIT_CHOICES[quantity].map((unit) => ({
            value: unit,
            label: t(`units.${unit}`),
          }))}
          onChange={(unit) => set({ units: { ...values.units, [quantity]: unit } })}
        />
      ))}
    </Stack>
  );
}

/** The certification bodies the operator accepts, of its template's industry */
export function CertificationsStep({ values, set, errors }: StepProps) {
  return (
    <Stack gap="xs">
      <CertificationBodyChipSelect
        industry={values.industry?.toLowerCase()}
        value={values.certificationBodies}
        onChange={(certificationBodies) => set({ certificationBodies })}
      />
      <FieldError>{errors.certificationBodies}</FieldError>
    </Stack>
  );
}
