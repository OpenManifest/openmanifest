import type { Breakpoint } from 'app/components/layout/useBreakpoint';
import { isOver } from './loadStatus';

export type BoardLayout = 'list' | 'split' | 'columns';

/** One column on a phone, the list beside the selected load on a tablet, a column for each load on a wide window */
export function layoutOf(breakpoint: Breakpoint): BoardLayout {
  if (breakpoint === 'compact') return 'list';
  return breakpoint === 'medium' ? 'split' : 'columns';
}

/** The widest the board's content grows */
export const MAX_CONTENT_WIDTH = 1600;
/** Columns this wide fit three on a 1440 window; past three the board scrolls sideways */
export const COLUMN_WIDTH = 440;
export const VISIBLE_COLUMNS = 3;

/** Loads still to fly (the board's columns) and loads that are over (its strip), each in the order they came */
export function splitLoads<T extends { state?: string | null }>(loads: readonly T[]) {
  return {
    active: loads.filter(({ state }) => !isOver(state)),
    over: loads.filter(({ state }) => isOver(state)),
  };
}
