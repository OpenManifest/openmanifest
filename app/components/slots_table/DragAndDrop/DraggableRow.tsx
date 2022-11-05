import * as React from 'react';
import type { ISlotUserRowProps } from '../UserRow';

interface IDraggableSlot {
  rowProps: ISlotUserRowProps;
  children(opts: { isDragging?: boolean }): JSX.Element;
}
export default function DraggableRow(props: IDraggableSlot) {
  const { children } = props;
  return children?.({ isDragging: false });
}
