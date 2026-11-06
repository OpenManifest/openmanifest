import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { DateTime } from 'luxon';
import { useManifestContext } from 'app/providers';

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
  const {
    manifest: { date, isToday, setDate, today },
  } = useManifestContext();
  if (!date) return null;

  return (
    <View style={styles.bar} testID="manifest-date-bar">
      <IconButton
        icon="chevron-left"
        accessibilityLabel="Previous day"
        testID="manifest-date-previous"
        onPress={() => setDate(shiftDay(date, -1))}
      />
      <Text variant="titleSmall" testID="manifest-date">
        {isToday ? `Today, ${formatDay(date)}` : formatDay(date)}
      </Text>
      <IconButton
        icon="chevron-right"
        accessibilityLabel="Next day"
        testID="manifest-date-next"
        onPress={() => setDate(shiftDay(date, 1))}
      />
      {isToday ? null : (
        <Button compact mode="text" testID="manifest-date-today" onPress={() => setDate(today)}>
          Today
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
});
