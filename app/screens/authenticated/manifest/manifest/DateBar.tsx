import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { useManifestContext } from 'app/providers';
import { Button, IconButton, Text, useTheme } from 'app/ui';

/** `2026-10-14` moved by this many days */
export function shiftDay(date: string, days: number): string {
  return DateTime.fromISO(date, { zone: 'utc' }).plus({ days }).toISODate() as string;
}

/** The day of the board, as people say it: "Tuesday 14 October" */
export function formatDay(date: string): string {
  return DateTime.fromISO(date, { zone: 'utc' }).toFormat('cccc d LLLL');
}

/**
 * The day the board shows: today (in the operator's time zone) until another one is picked. A load made on the board is
 * made for that day, so a load can be scheduled ahead.
 */
export default function DateBar() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const {
    manifest: { date, isToday, setDate, today },
  } = useManifestContext();
  if (!date) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space.xs,
        paddingTop: theme.space.sm,
      }}
      testID="manifest-date-bar"
    >
      <IconButton
        icon="chevron-left"
        aria-label={t('board.dateBar.previous')}
        testID="manifest-date-previous"
        onPress={() => setDate(shiftDay(date, -1))}
      />
      <Text variant="label" testID="manifest-date">
        {isToday ? t('board.dateBar.today', { day: formatDay(date) }) : formatDay(date)}
      </Text>
      <IconButton
        icon="chevron-right"
        aria-label={t('board.dateBar.next')}
        testID="manifest-date-next"
        onPress={() => setDate(shiftDay(date, 1))}
      />
      {isToday ? null : (
        <Button
          variant="tertiary"
          label={t('board.dateBar.backToToday')}
          testID="manifest-date-today"
          onPress={() => setDate(today)}
        />
      )}
    </View>
  );
}
