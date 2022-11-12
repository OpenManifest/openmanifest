import * as React from 'react';
import { Dimensions, RefreshControl, useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { useDropzoneContext } from 'app/providers';

import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';

import SlotCard from 'app/components/cards/SlotCard';
import { slotLoadingFragment } from 'app/__fixtures__/slots.fixtures';

interface ICardViewProps {
  load?: LoadDetailsFragment;
  loading: boolean;
  onSlotPress(slot: SlotDetailsFragment): void;
  onDeletePress(slot: SlotDetailsFragment): void;
  refetch(): void;
}

const CARD_WIDTH = 364;

export default function LoadScreen(props: ICardViewProps) {
  const { load, loading, refetch, onSlotPress, onDeletePress } = props;
  const [isExpanded, setExpanded] = React.useState(false);

  const { dropzone: currentDropzone } = useDropzoneContext();
  const { currentUser } = currentDropzone;

  const canRemoveSelf = useRestriction(Permission.DeleteSlot);
  const canRemoveOthers = useRestriction(Permission.DeleteUserSlot);

  React.useEffect(() => {
    if (load?.maxSlots && load?.maxSlots < 5 && !isExpanded) {
      setExpanded(true);
    }
  }, [isExpanded, load?.maxSlots]);

  const slots: SlotDetailsFragment[] = Array.from({
    length: (load?.slots?.length || 0) + (load?.availableSlots || 0),
  }).map((_, index) =>
    (load?.slots?.length || 0) > index
      ? (load?.slots as SlotDetailsFragment[])[index]
      : { ...slotLoadingFragment, id: '__AVAILABLE__' }
  );

  const { width } = useWindowDimensions();

  const padding = 24;
  const numColumns = Math.floor(width / (CARD_WIDTH + padding)) || 1;
  let contentWidth = (CARD_WIDTH + padding) * numColumns + padding;
  contentWidth = width < contentWidth ? width : contentWidth;

  const initialLoading = !load?.slots?.length && loading;

  const renderItem = React.useCallback(
    ({ item: node, index }: { item: SlotDetailsFragment; index: number }) => {
      if (node.id === '__LOADING__') {
        return <SlotCard width={CARD_WIDTH} variant="loading" />;
      }

      return node.id === '__AVAILABLE__' ? (
        <SlotCard width={CARD_WIDTH} variant="available" />
      ) : (
        <SlotCard
          width={CARD_WIDTH}
          variant="user"
          style={{ width: CARD_WIDTH }}
          key={`slot-${node.id}`}
          slot={node}
          onDelete={
            (currentUser?.id === node?.dropzoneUser?.id && canRemoveSelf) || canRemoveOthers
              ? onDeletePress
              : undefined
          }
          onPress={onSlotPress}
        />
      );
    },
    [canRemoveOthers, canRemoveSelf, currentUser?.id, onDeletePress, onSlotPress]
  );
  return (
    <FlatList<SlotDetailsFragment>
      testID="slots"
      keyExtractor={(_, idx) => `slot-${idx}`}
      style={{ flex: 1, height: Dimensions.get('window').height }}
      contentContainerStyle={{
        width: contentWidth,
        alignSelf: 'center',
        justifyContent: 'space-evenly',
        paddingBottom: 100,
      }}
      numColumns={numColumns}
      horizontal={false}
      data={!initialLoading ? slots : new Array(8).fill(slotLoadingFragment)}
      refreshing={loading}
      onRefresh={refetch}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      {...{ renderItem }}
    />
  );
}
