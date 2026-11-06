import type { Breakpoint } from 'app/components/layout/useBreakpoint';

export type Presentation = 'auto' | 'sheet' | 'dialog' | 'panel';

/**
 * Where an overlay appears. `auto`: a bottom sheet on a native phone, a side panel on a wide window, a dialog
 * otherwise (the web on a narrow window, a tablet).
 */
export function resolvePresentation(
  presentation: Presentation,
  { breakpoint, native }: { breakpoint: Breakpoint; native: boolean }
): Exclude<Presentation, 'auto'> {
  if (presentation !== 'auto') return presentation;
  if (native && breakpoint === 'compact') return 'sheet';
  if (breakpoint === 'expanded') return 'panel';
  return 'dialog';
}
