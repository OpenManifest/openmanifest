import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { useFinalizeLoadMutation, useUpdateLoadMutation } from 'app/api/reflection';
import type { CrewRoleEssentialsFragment, LoadDetailsFragment } from 'app/api/operations';
import { LoadState, Permission } from 'app/api/schema.d';
import { isConflict } from 'app/api/crud/useLoad';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorTimeZone, useOperatorToday } from 'app/hooks/useOperatorToday';
import { useNotifications } from 'app/providers/notifications';
import { useOperatorContext } from 'app/providers/operator/context';
import { dateInZone } from 'app/utils/operatorTime';
import { crewSlots } from './crew';
import { planActions, type LoadActionKey } from './loadActions';

type Outcome = { ok: true } | { ok: false; error: string };

/**
 * The next actions of a load: the plan by its state, and each action as a call that reports in a toast. Several cards
 * use it at once, so it talks to the mutations itself instead of loading the load again.
 */
export function useLoadActions(
  load: Pick<
    LoadDetailsFragment,
    'id' | 'state' | 'lockVersion' | 'createdAt' | 'vehicles' | 'crew'
  >,
  crewRoles: readonly CrewRoleEssentialsFragment[] = []
) {
  const { t } = useTranslation(['common', 'terms']);
  const notify = useNotifications();
  const [updateLoad] = useUpdateLoadMutation();
  const [finalizeLoad] = useFinalizeLoadMutation();
  const [busy, setBusy] = React.useState(false);
  const canUpdate = useRestriction(Permission.UpdateLoad);
  const today = useOperatorToday();
  const timeZone = useOperatorTimeZone();
  const {
    operator: { operator },
  } = useOperatorContext();
  const callMinutes = React.useMemo(
    () => operator?.callScheduleMinutes ?? [],
    [operator?.callScheduleMinutes]
  );
  const isToday = dateInZone(load.createdAt, timeZone) === today;
  const plan = planActions({ state: load.state, callMinutes, canUpdate, isToday });

  // A load leaves with the crew it needs: the roles that are required and empty
  const missing = React.useMemo(
    () =>
      crewSlots(load, crewRoles)
        .filter(({ role, member }) => role.required && !member)
        .map(({ label, role }) => label ?? role.name),
    [load, crewRoles]
  );
  const blocked = (action: LoadActionKey) =>
    action === 'depart' && missing.length
      ? t('common:board.actions.crewMissing', { roles: missing.join(', ') })
      : null;

  const fail = React.useCallback(
    (error: string): Outcome => {
      notify.error(error);
      return { ok: false, error };
    },
    [notify]
  );

  const update = React.useCallback(
    async (attributes: Record<string, unknown>): Promise<Outcome> => {
      try {
        const { data } = await updateLoad({
          variables: {
            id: load.id,
            // The version this change is based on: refused when somebody else changed the load since
            attributes: { lockVersion: load.lockVersion, ...attributes },
          },
        });
        const error =
          data?.updateLoad?.errors?.[0] || data?.updateLoad?.fieldErrors?.[0]?.message || null;
        if (error) return fail(error);
        if (!data?.updateLoad?.load) return fail(t('common:board.actions.failed'));
        return { ok: true };
      } catch (e) {
        return fail(
          isConflict(e) ? t('common:board.actions.conflict') : t('common:board.actions.failed')
        );
      }
    },
    [fail, load.id, load.lockVersion, t, updateLoad]
  );

  const finalize = React.useCallback(
    async (state: LoadState.Completed | LoadState.Cancelled): Promise<Outcome> => {
      try {
        const { data } = await finalizeLoad({ variables: { id: Number(load.id), state } });
        const error =
          data?.finalizeLoad?.errors?.[0] || data?.finalizeLoad?.fieldErrors?.[0]?.message || null;
        if (error) return fail(error);
        if (!data?.finalizeLoad?.load) return fail(t('common:board.actions.failed'));
        return { ok: true };
      } catch {
        return fail(t('common:board.actions.failed'));
      }
    },
    [fail, finalizeLoad, load.id, t]
  );

  /** Runs an action; `minutes` is the call (a number of minutes from now) */
  const run = React.useCallback(
    async (action: LoadActionKey, minutes?: number): Promise<Outcome> => {
      const reason = blocked(action);
      if (reason) return fail(reason);
      setBusy(true);
      try {
        switch (action) {
          case 'call':
            return await update({
              dispatchAt: DateTime.local()
                .plus({ minutes: minutes ?? 0 })
                .toISO(),
              state: LoadState.Boarding,
            });
          case 'cancelCall':
          case 'reopen':
            return await update({ dispatchAt: null, state: LoadState.Open });
          case 'depart':
            return await update({ dispatchAt: null, state: LoadState.Departed });
          case 'complete':
            return await finalize(LoadState.Completed);
          case 'cancelLoad':
            return await finalize(LoadState.Cancelled);
          default:
            return fail(t('common:board.actions.failed'));
        }
      } finally {
        setBusy(false);
      }
    },
    // `blocked` closes over `missing`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fail, finalize, missing, t, update]
  );

  return { plan, callMinutes, busy, run, blocked, missing };
}
