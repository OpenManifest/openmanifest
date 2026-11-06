import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'app/ui';
import type { LoadDetailsFragment } from 'app/api/operations';
import { placesOf } from 'app/features/board/places';
import BookJump from 'app/features/picker/BookJump';

export type BookCardProps = {
  /** The load the member can still get on: the first of the day */
  load: LoadDetailsFragment;
  onClose?(): void;
  testID?: string;
};

/** What a member with no load for the day is offered: book the next load that has a place, in the picker for themselves */
export default function BookCard({ load, onClose, testID = 'today-book' }: BookCardProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const title = t('common:loadNumber', {
    load: t('terms:load', { count: 1 }),
    number: load.loadNumber,
  });
  const { capacity, filled } = placesOf(load);

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
      <Text variant="title" role="heading" aria-level={2}>
        {t('common:today.book.title')}
      </Text>
      <Text tone="muted">
        {t('common:today.book.body', { load: title, count: Math.max(0, capacity - filled) })}
      </Text>
      <BookJump
        load={load}
        label={t('common:today.book.action')}
        onClose={onClose}
        testID={`${testID}-action`}
      />
    </View>
  );
}
