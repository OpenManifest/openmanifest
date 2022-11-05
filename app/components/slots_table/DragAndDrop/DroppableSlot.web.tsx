import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useAppSelector } from 'app/state';

export default function DroppableSlot(
  props: React.PropsWithChildren<{ rowIndex: number; loadId: string; slotId?: string }>
) {
  const { rowIndex, loadId, slotId, children } = props;
  const { setNodeRef, isOver, active } = useDroppable({
    id: `load-${loadId}-row-${rowIndex}`,
    data: {
      slotId,
      loadId,
    },
  });
  const theme = useAppSelector((root) => root.global.theme);

  const style: StyleProp<ViewStyle> = React.useMemo(
    () => ({
      backgroundColor:
        isOver && active?.data?.current?.props?.load?.id !== loadId
          ? theme.colors.primary
          : undefined,
      opacity: isOver ? 0.5 : undefined,
    }),
    [active?.data, isOver, loadId, theme.colors.primary]
  );

  return (
    <div ref={setNodeRef} className="droppable-wrapper">
      <View {...{ style }}>{children}</View>
    </div>
  );
}
