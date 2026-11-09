import { LoadState } from 'app/api/schema.d';

export type LoadActionKey = 'call' | 'depart' | 'complete' | 'cancelCall' | 'cancelLoad' | 'reopen';

export type ActionPlan = {
  /** The one button on the card: what is most likely to happen next */
  primary: LoadActionKey | null;
  /** The rest, in a menu */
  menu: LoadActionKey[];
};

export type PlanInput = {
  state?: LoadState | string | null;
  /** The calls the operator offers; none means the load departs directly */
  callMinutes: readonly number[];
  /** May change loads at all */
  canUpdate: boolean;
  /** The load is for the day the board shows as today at the operator */
  isToday: boolean;
};

const NONE: ActionPlan = { primary: null, menu: [] };

/**
 * What can happen to a load next, by its state: open → call (or depart, without a call schedule) → depart → complete,
 * with cancel call, cancel load and re-open on the side. The server refuses the rest.
 */
export function planActions({ state, callMinutes, canUpdate, isToday }: PlanInput): ActionPlan {
  if (!canUpdate) return NONE;

  switch (state) {
    case LoadState.Open:
      if (!isToday) return { primary: null, menu: ['cancelLoad'] };
      return callMinutes.length
        ? { primary: 'call', menu: ['depart', 'cancelLoad'] }
        : { primary: 'depart', menu: ['cancelLoad'] };
    case LoadState.Boarding:
      return { primary: 'depart', menu: ['cancelCall', 'complete'] };
    case LoadState.Departed:
      return { primary: 'complete', menu: [] };
    case LoadState.Completed:
    case LoadState.Cancelled:
      return isToday ? { primary: 'reopen', menu: [] } : NONE;
    default:
      return NONE;
  }
}

/** Actions that ask first: cancelling a load, and landing one that never departed (its places would count as flown) */
export function needsConfirmation(action: LoadActionKey, state?: LoadState | string | null) {
  return action === 'cancelLoad' || (action === 'complete' && state === LoadState.Boarding);
}
