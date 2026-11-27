import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, ListRow, Overlay, StatusBadge, useTheme } from 'app/ui';
import type { SlotDetailsFragment } from 'app/api/operations';
import { useManifestContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import { moveTargets, type MoveTarget } from './targets';

export type MoveToSheetProps = {
  slot: SlotDetailsFragment;
  /** The load the place is on now */
  loadId: string;
  open: boolean;
  onClose(): void;
  testID?: string;
};

/**
 * Where a place can go: the other loads of the day, and the vehicles of a load that has several. Each says how many
 * places it has free, or why it cannot take one (it has left, or it is full).
 */
export default function MoveToSheet({
  slot,
  loadId,
  open,
  onClose,
  testID = 'move-to',
}: MoveToSheetProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const notify = useNotifications();
  const {
    manifest: { loads, moveSlot },
  } = useManifestContext();
  const [moving, setMoving] = React.useState<string | null>(null);

  const targets = React.useMemo(
    () =>
      moveTargets(
        loads.filter((load): load is NonNullable<typeof load> => !!load),
        { loadId, loadVehicleId: slot.loadVehicle?.id }
      ),
    [loadId, loads, slot.loadVehicle?.id]
  );
  const name = slot.membership?.user?.nickname || slot.membership?.user?.name || '';
  const loadTerm = String(t('terms:load', { count: 1 }));

  const label = (target: MoveTarget) =>
    target.vehicleName
      ? t('common:move.loadVehicle', {
          load: loadTerm,
          number: target.loadNumber,
          vehicle: target.vehicleName,
        })
      : t('common:loadNumber', { load: loadTerm, number: target.loadNumber });

  const move = async (target: MoveTarget) => {
    setMoving(target.key);
    try {
      const response = await moveSlot(loadId, {
        sourceSlot: Number(slot.id),
        targetLoad: Number(target.loadId),
        targetLoadVehicle: target.loadVehicleId ? Number(target.loadVehicleId) : undefined,
      });
      if ('loads' in response) {
        notify.success(t('common:move.moved', { name, target: label(target) }));
        onClose();
      } else {
        notify.error(
          response.error ?? response.fieldErrors?.[0]?.message ?? t('common:board.actions.failed')
        );
      }
    } finally {
      setMoving(null);
    }
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={t('common:move.title', { name })}
      disablePadding
      testID={testID}
    >
      {targets.length ? (
        <View style={{ paddingVertical: theme.space.sm }}>
          {targets.map((target) => (
            <ListRow
              key={target.key}
              testID={`${testID}-${target.key.replace(':', '-')}`}
              title={label(target)}
              supporting={
                target.blocked
                  ? t(`common:move.blocked.${target.blocked}`)
                  : t('common:move.free', { count: target.free })
              }
              disabled={!!target.blocked || moving !== null}
              onPress={() => move(target)}
              trailing={
                target.blocked ? (
                  <StatusBadge
                    status="blocked"
                    label={t(`common:move.blocked.${target.blocked}`)}
                  />
                ) : null
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState icon="swap-horizontal" title={t('common:move.nowhere')} />
      )}
    </Overlay>
  );
}
