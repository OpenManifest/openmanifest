import { LoadState } from 'app/api/schema.d';
import type { StatusKey } from 'app/ui';

/** The status token of a load state: a completed load has landed */
export function statusOf(state?: LoadState | string | null): StatusKey {
  switch (state) {
    case LoadState.Boarding:
      return 'boarding';
    case LoadState.Departed:
      return 'departed';
    case LoadState.Completed:
      return 'landed';
    case LoadState.Cancelled:
      return 'cancelled';
    default:
      return 'open';
  }
}

/** A load that is over: it goes to the strip at the end of the board and is shown quieter */
export function isOver(state?: LoadState | string | null): boolean {
  return state === LoadState.Completed || state === LoadState.Cancelled;
}
