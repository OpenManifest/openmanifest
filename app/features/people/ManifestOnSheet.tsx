import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, ListRow, Overlay, StatusBadge, useTheme } from 'app/ui';
import type { LoadDetailsFragment } from 'app/api/operations';
import { statusOf } from 'app/features/board/loadStatus';
import { manifestTargets } from './people';

export type ManifestOnSheetProps = {
  /** Whom to put on a load: the name the title says */
  name: string;
  loads: readonly (LoadDetailsFragment | null | undefined)[];
  open: boolean;
  onClose(): void;
  /** The load chosen: the picker opens on it with the person picked */
  onPick(load: LoadDetailsFragment): void;
  /** No load is open: the board, where one is made */
  onBoard(): void;
  testID?: string;
};

/**
 * "Manifest on…": the loads of the day that still take people (open, or on call), each with its free places; a full one
 * says so and cannot be chosen.
 */
export default function ManifestOnSheet({
  name,
  loads,
  open,
  onClose,
  onPick,
  onBoard,
  testID = 'people-manifest-on',
}: ManifestOnSheetProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const targets = React.useMemo(() => manifestTargets(loads), [loads]);
  const loadTerm = String(t('terms:load', { count: 1 }));

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={t('common:people.manifestOn.title', { name })}
      disablePadding
      testID={testID}
    >
      {targets.length ? (
        <View style={{ paddingVertical: theme.space.sm }}>
          {targets.map(({ load, free }) => (
            <ListRow
              key={load.id}
              testID={`${testID}-${load.id}`}
              title={t('common:loadNumber', { load: loadTerm, number: load.loadNumber })}
              supporting={
                free
                  ? t('common:load.freePlaces', { count: free })
                  : t('common:people.manifestOn.full')
              }
              disabled={!free}
              onPress={() => onPick(load)}
              trailing={
                <StatusBadge
                  status={statusOf(load.state)}
                  label={String(t(`terms:state.${load.state}`, { defaultValue: load.state ?? '' }))}
                />
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          testID={`${testID}-nowhere`}
          icon="airplane-off"
          title={t('common:people.manifestOn.nowhere')}
          body={t('common:people.manifestOn.nowhereBody')}
          action={{ label: t('common:people.manifestOn.board'), onPress: onBoard }}
        />
      )}
    </Overlay>
  );
}
