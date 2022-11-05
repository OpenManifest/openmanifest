import { DragOverlay } from '@dnd-kit/core';
import * as React from 'react';
import UserRow from '../UserRow';
import type { ISlotUserRowProps } from '../UserRow';

export default function DraggingRow(props: { item?: ISlotUserRowProps }) {
  const { item } = props;
  return <DragOverlay>{item ? <UserRow {...item} /> : null}</DragOverlay>;
}
