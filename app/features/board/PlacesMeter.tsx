import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProgressMeter } from 'app/ui';
import type { LoadDetailsFragment } from 'app/api/operations';
import { placesOf } from './places';

export type PlacesMeterProps = {
  load: Parameters<typeof placesOf>[0] & Pick<LoadDetailsFragment, 'id'>;
  testID?: string;
};

/** "6 of 15 slots": the places taken on a load, red when it is full and amber from three quarters */
export default function PlacesMeter({ load, testID }: PlacesMeterProps) {
  const { t } = useTranslation(['common', 'terms']);
  const { capacity, filled } = placesOf(load);
  const slots = t('terms:slot', { count: 2 });
  const full = capacity > 0 && filled >= capacity;
  const nearlyFull = capacity > 0 && filled / capacity >= 0.75;

  return (
    <ProgressMeter
      testID={testID}
      label={t('common:board.placesLabel', { slots })}
      value={filled}
      max={capacity}
      valueText={t('common:board.places', { filled, capacity, slots: slots.toLowerCase() })}
      tone={full ? 'blocked' : nearlyFull ? 'warning' : 'brand'}
    />
  );
}
