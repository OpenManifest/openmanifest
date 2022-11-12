import * as React from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import UserRowDragOverlay from 'app/components/slots_table/DragAndDrop/DraggingRow';
import type { ISlotUserRowProps } from 'app/components/slots_table/UserRow';
import { useManifestContext } from 'app/providers';
import { actions, useAppDispatch } from 'app/state';

export default function DragDropWrapper(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const [draggedItem, setDraggedItem] = React.useState<ISlotUserRowProps>();
  const {
    manifest: { moveSlot },
  } = useManifestContext();
  const dispatch = useAppDispatch();

  const onDragEnd = React.useCallback(
    async (event: DragEndEvent) => {
      const targetLoad = event.over?.data?.current?.loadId;
      const sourceLoad = event.active.data.current?.loadId;
      const sourceSlot = event?.active?.data?.current?.slotId;
      const targetSlot = event?.over?.data?.current?.slotId;

      console.debug(`Moving Slot ${sourceSlot} from Load ${sourceLoad} to Load ${targetLoad}`, {
        targetLoad,
        sourceLoad,
        sourceSlot,
      });

      if (sourceLoad !== targetLoad) {
        const response = await moveSlot(sourceLoad, {
          targetLoad: Number(targetLoad),
          sourceSlot: Number(sourceSlot),
          targetSlot: targetSlot ? Number(targetSlot) : undefined,
        });

        if ('error' in response && response.error) {
          dispatch(actions.notifications.showSnackbar({ message: response.error }));
        }
      }
    },
    [dispatch, moveSlot]
  );
  return (
    <DndContext
      onDragStart={(event: DragStartEvent) => {
        console.debug('Drag start', event, event?.active?.data?.current?.props);
        setDraggedItem(event?.active?.data?.current?.props);
      }}
      onDragEnd={onDragEnd}
    >
      {children}
      <UserRowDragOverlay item={draggedItem} />
    </DndContext>
  );
}
