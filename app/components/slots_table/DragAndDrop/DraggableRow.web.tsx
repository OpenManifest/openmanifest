import * as React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { View } from 'react-native';
import { useManifestContext } from 'app/providers/manifest';
import type { ISlotUserRowProps } from '../UserRow';

interface IDraggableSlot {
  rowProps: ISlotUserRowProps;
  children(opts: { isDragging?: boolean }): JSX.Element;
}
export default function DraggableRow(props: IDraggableSlot) {
  const { children, rowProps } = props;
  const {
    manifest: { permissions },
  } = useManifestContext();
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: rowProps.slot?.id,
    disabled: !permissions.canUpdateSlot,
    data: {
      slotId: rowProps.slot?.id,
      loadId: rowProps.load?.id,
      props: rowProps,
    },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="draggable-wrapper">
      <View pointerEvents="box-none">{children?.({ isDragging })}</View>
    </div>
  );
}
