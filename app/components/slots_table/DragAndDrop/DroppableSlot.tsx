import * as React from 'react';

export default function DroppableSlot(
  props: React.PropsWithChildren<{ rowIndex: number; loadId: string; slotId?: string }>
) {
  const { children } = props;
  return children as JSX.Element;
}
