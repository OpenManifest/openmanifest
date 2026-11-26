import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'app/ui';
import { useManifestContext } from 'app/providers';
import { useNotifications } from 'app/providers/notifications';
import type { BoardDndProviderProps, DraggablePlaceProps, DroppableLoadProps } from './BoardDnd';

export const DRAG_AND_DROP = true;
export type { BoardDndProviderProps, DraggablePlaceProps, DroppableLoadProps };

type PlaceData = { slotId: string; loadId: string; name: string; loadLabel: string };
type LoadData = { loadId: string; loadLabel: string };

/** Left and right go to the next column: a column is where a place can be dropped, so the arrows jump to the next one */
const nextColumn: KeyboardCoordinateGetter = (
  event,
  { context: { droppableRects, collisionRect } }
) => {
  if (!collisionRect || (event.code !== 'ArrowRight' && event.code !== 'ArrowLeft'))
    return undefined;
  event.preventDefault();
  const rects = [...droppableRects.values()].sort((a, b) => a.left - b.left);
  const here = rects.findIndex(
    ({ left, right }) =>
      collisionRect.left + collisionRect.width / 2 >= left && collisionRect.left < right
  );
  const next = rects[here + (event.code === 'ArrowRight' ? 1 : -1)];
  return next ? { x: next.left + 8, y: next.top + 8 } : undefined;
};

/**
 * Drag and drop of the places between the columns of the board (web, at the widest layout). A place is picked up with the
 * pointer or with Space; the arrows move it from column to column and Space drops it. The board holds its order while
 * a place is held, so no column moves under the pointer. Each step is announced for screen readers.
 */
export function BoardDndProvider({ children, onFreeze, onUnfreeze }: BoardDndProviderProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const notify = useNotifications();
  const {
    manifest: { moveSlot },
  } = useManifestContext();
  const [held, setHeld] = React.useState<PlaceData | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: nextColumn })
  );

  const announcements: Announcements = React.useMemo(
    () => ({
      onDragStart: ({ active }) =>
        t('move.picked', {
          name: (active.data.current as PlaceData).name,
          load: (active.data.current as PlaceData).loadLabel,
        }),
      onDragOver: ({ active, over }) =>
        over
          ? t('move.over', {
              name: (active.data.current as PlaceData).name,
              load: (over.data.current as LoadData).loadLabel,
            })
          : undefined,
      onDragEnd: ({ active, over }) =>
        over && (over.data.current as LoadData).loadId !== (active.data.current as PlaceData).loadId
          ? t('move.dropped', {
              name: (active.data.current as PlaceData).name,
              load: (over.data.current as LoadData).loadLabel,
            })
          : t('move.cancelled', { name: (active.data.current as PlaceData).name }),
      onDragCancel: ({ active }) =>
        t('move.cancelled', { name: (active.data.current as PlaceData).name }),
    }),
    [t]
  );

  const start = React.useCallback(
    ({ active }: DragStartEvent) => {
      setHeld(active.data.current as PlaceData);
      onFreeze?.();
    },
    [onFreeze]
  );
  const end = React.useCallback(
    async ({ active, over }: DragEndEvent) => {
      setHeld(null);
      try {
        const source = active.data.current as PlaceData;
        const target = over?.data.current as LoadData | undefined;
        if (!target || target.loadId === source.loadId) return;
        const response = await moveSlot(source.loadId, {
          sourceSlot: Number(source.slotId),
          targetLoad: Number(target.loadId),
        });
        if ('loads' in response) {
          notify.success(t('move.moved', { name: source.name, target: target.loadLabel }));
        } else {
          notify.error(
            response.error ?? response.fieldErrors?.[0]?.message ?? t('board.actions.failed')
          );
        }
      } finally {
        onUnfreeze?.();
      }
    },
    [moveSlot, notify, onUnfreeze, t]
  );
  const cancel = React.useCallback(() => {
    setHeld(null);
    onUnfreeze?.();
  }, [onUnfreeze]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t('move.instructions') },
      }}
      onDragStart={start}
      onDragEnd={end}
      onDragCancel={cancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {held ? (
          <div
            data-testid="board-drag-overlay"
            style={{
              padding: `${theme.space.sm}px ${theme.space.md}px`,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colour.surface,
              border: `1px solid ${theme.colour.brand}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <Text>{held.name}</Text>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** A person of a column that can be picked up (with the pointer, or Space on the keyboard) */
export function DraggablePlace({
  slotId,
  loadId,
  name,
  loadLabel,
  disabled = false,
  testID,
  children,
}: DraggablePlaceProps) {
  const { t } = useTranslation('common');
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: slotId,
    disabled,
    data: { slotId, loadId, name, loadLabel } satisfies PlaceData,
  });
  return (
    <div
      ref={setNodeRef}
      data-testid={testID}
      {...(disabled ? {} : listeners)}
      {...attributes}
      aria-label={t('move.draggable', { name })}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: disabled ? 'default' : 'grab',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  );
}

/** A column of the board: where a place can be dropped */
export function DroppableLoad({
  loadId,
  loadLabel,
  disabled = false,
  testID,
  children,
}: DroppableLoadProps) {
  const theme = useTheme();
  const { setNodeRef, isOver } = useDroppable({
    id: `load-${loadId}`,
    disabled,
    data: { loadId, loadLabel } satisfies LoadData,
  });
  return (
    <div
      ref={setNodeRef}
      data-testid={testID}
      data-over={isOver ? 'true' : undefined}
      style={{
        borderRadius: theme.radius.lg,
        outline: isOver ? `2px solid ${theme.colour.brand}` : '2px solid transparent',
        outlineOffset: 2,
      }}
    >
      {children}
    </div>
  );
}
