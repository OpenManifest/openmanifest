import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Text, useTheme } from 'app/ui';
import { useLoadContext, useManifestContext } from 'app/providers';
import { DraggablePlace } from './dnd/BoardDnd';

export type ColumnPlacesProps = {
  /** What the load is called in what screen readers hear: "Load #2" */
  loadLabel: string;
  testID?: string;
};

/**
 * The people of a load under its card, for the widest layout: each is a place that can be dragged to another column
 * (on the web). Must sit inside the load's context.
 */
export default function ColumnPlaces({ loadLabel, testID = 'board-places' }: ColumnPlacesProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const {
    load: { load },
  } = useLoadContext();
  const {
    manifest: { permissions },
  } = useManifestContext();
  const slots = load?.slots ?? [];
  if (!load || !slots.length) return null;

  return (
    <View testID={testID} style={{ gap: theme.space.xs }}>
      {slots.map((slot) => {
        const user = slot.membership?.user;
        const name = user?.nickname || user?.name || '';
        return (
          <DraggablePlace
            key={slot.id}
            slotId={slot.id}
            loadId={load.id}
            name={name}
            loadLabel={loadLabel}
            disabled={!permissions.canUpdateSlot}
            testID={`${testID}-${slot.id}`}
          >
            <View
              testID="board-place"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
                paddingVertical: theme.space.xs,
                paddingHorizontal: theme.space.sm,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colour.surface,
                borderWidth: 1,
                borderColor: theme.colour.border,
              }}
            >
              <Avatar name={name} imageUri={user?.image} size="sm" />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1}>{name}</Text>
                {slot.activityType?.name ? (
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {slot.activityType.name}
                    {slot.guestSlots?.length
                      ? ` · ${t('board.guests', { count: slot.guestSlots.length })}`
                      : ''}
                  </Text>
                ) : null}
              </View>
            </View>
          </DraggablePlace>
        );
      })}
    </View>
  );
}
