import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ListRow, StatusBadge, Text, useTheme } from 'app/ui';
import type { LoadDetailsFragment } from 'app/api/operations';
import { statusOf } from 'app/features/board/loadStatus';
import { placesOf } from 'app/features/board/places';

export type TodayLoadsProps = {
  loads: readonly LoadDetailsFragment[];
  /** The load the member has a place on, marked in the list */
  mineIds?: ReadonlySet<string>;
  onOpen?(load: LoadDetailsFragment): void;
  testID?: string;
};

/** The loads of the day, one row each: what state it is in and how full, with the member's own marked */
export default function TodayLoads({
  loads,
  mineIds,
  onOpen,
  testID = 'today-loads',
}: TodayLoadsProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={{
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
        paddingVertical: theme.space.sm,
      }}
    >
      <View style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.sm }}>
        <Text variant="title" role="heading" aria-level={2}>
          {t('common:today.loads.title')}
        </Text>
      </View>
      {loads.map((load) => {
        const { capacity, filled } = placesOf(load);
        const title = t('common:loadNumber', {
          load: t('terms:load', { count: 1 }),
          number: load.loadNumber,
        });
        const mine = mineIds?.has(load.id);
        return (
          <ListRow
            key={load.id}
            testID={`${testID}-${load.id}`}
            title={mine ? `${title} · ${t('common:today.loads.yours')}` : title}
            aria-label={`${title}, ${t(`terms:state.${load.state}`)}`}
            supporting={t('common:today.next.places', { filled, capacity })}
            selected={!!mine}
            onPress={onOpen ? () => onOpen(load) : undefined}
            trailing={
              <StatusBadge
                status={statusOf(load.state)}
                label={String(t(`terms:state.${load.state}`))}
              />
            }
          />
        );
      })}
    </View>
  );
}
