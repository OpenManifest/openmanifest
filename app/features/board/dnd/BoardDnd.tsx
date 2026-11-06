import * as React from 'react';

/** Dragging places between the columns of the board is for the web: elsewhere a place moves with "Move to…" */
export const DRAG_AND_DROP = false;

export type BoardDndProviderProps = React.PropsWithChildren<{
  /** Called when a drag starts and when it ends or is cancelled: the board holds its order in between */
  onFreeze?(): void;
  onUnfreeze?(): void;
}>;

export function BoardDndProvider({ children }: BoardDndProviderProps) {
  return <>{children}</>;
}

export type DraggablePlaceProps = React.PropsWithChildren<{
  slotId: string;
  loadId: string;
  name: string;
  loadLabel: string;
  disabled?: boolean;
  testID?: string;
}>;

export function DraggablePlace({ children }: DraggablePlaceProps) {
  return <>{children}</>;
}

export type DroppableLoadProps = React.PropsWithChildren<{
  loadId: string;
  loadLabel: string;
  disabled?: boolean;
  testID?: string;
}>;

export function DroppableLoad({ children }: DroppableLoadProps) {
  return <>{children}</>;
}
