import * as React from 'react';

export type TooltipProps = {
  /** What it says: a short name or hint for the control, never the only place an instruction is given */
  label: string;
  /** The control it describes: one pressable element */
  children: React.ReactElement;
};

/**
 * A hint that appears when the control has hover or keyboard focus (`Tooltip.web.tsx`). Touch screens have no hover, so
 * on native it shows nothing and returns the control as it is: controls name themselves (`aria-label`), and a
 * tooltip must never carry what a person needs to know.
 */
export default function Tooltip({ children }: TooltipProps) {
  return children;
}
