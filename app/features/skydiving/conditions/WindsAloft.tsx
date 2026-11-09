import * as React from 'react';
import { NavigationRouteContext, useNavigation } from '@react-navigation/native';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import ConditionsPanel from './ConditionsPanel';
import ConditionsStrip from './ConditionsStrip';
import { hasWindsAloft } from './conditions';

/** The board's route parameter that opens the conditions panel (`/manifest?conditions=open`, the old `/weather` pages) */
export const OPEN_CONDITIONS = 'open';

/**
 * The conditions panel of the board: open while `show` was called or the route asked for it with
 * `conditions: 'open'` (the parameter is cleared once read). It opens only for an operator with winds aloft and for
 * someone who may change the conditions.
 */
export function useConditionsPanel() {
  const navigation = useNavigation();
  // The route's parameters when it is in a navigator (a test may render the board without one)
  const route = React.useContext(NavigationRouteContext);
  const {
    operator: { operator, permissionsLoaded },
  } = useOperatorContext();
  const canUpdate = useRestriction(Permission.UpdateWeatherConditions);
  const available = hasWindsAloft(operator?.modules);
  const [open, setOpen] = React.useState(false);
  const requested =
    (route?.params as { conditions?: string } | undefined)?.conditions === OPEN_CONDITIONS;

  React.useEffect(() => {
    if (!requested || !operator || !permissionsLoaded) return;
    if (available && canUpdate) setOpen(true);
    navigation.setParams?.({ conditions: undefined } as never);
  }, [requested, operator, permissionsLoaded, available, canUpdate, navigation]);

  const show = React.useCallback(() => setOpen(true), []);
  const close = React.useCallback(() => setOpen(false), []);
  return { open, show, close, available, canUpdate };
}

/** The conditions panel of the operator in context, for `useConditionsPanel`'s state */
export function OperatorConditionsPanel({ open, onClose }: { open: boolean; onClose(): void }) {
  const {
    operator: { operator },
  } = useOperatorContext();
  return (
    <ConditionsPanel
      open={open}
      onClose={onClose}
      conditions={operator?.currentConditions}
      operatorId={operator?.id}
      canFetch={!!operator?.lat && !!operator?.lng}
    />
  );
}

/**
 * The conditions of the day on the board for an operator with winds aloft: the strip, and the panel its Update button
 * (or the route) opens. Nothing for other operators.
 */
export default function WindsAloft({ testID = 'board-conditions' }: { testID?: string }) {
  const {
    operator: { operator },
  } = useOperatorContext();
  const panel = useConditionsPanel();
  if (!panel.available) return null;
  return (
    <>
      <ConditionsStrip
        testID={testID}
        conditions={operator?.currentConditions}
        onUpdate={panel.canUpdate ? panel.show : undefined}
      />
      <OperatorConditionsPanel open={panel.open} onClose={panel.close} />
    </>
  );
}
