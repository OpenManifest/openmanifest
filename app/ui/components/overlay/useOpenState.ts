import * as React from 'react';

/** Open state that works controlled (`open`) or by itself */
export default function useOpenState(open?: boolean, onOpenChange?: (open: boolean) => void) {
  const [inner, setInner] = React.useState(false);
  const current = open ?? inner;
  const set = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  return [current, set] as const;
}
