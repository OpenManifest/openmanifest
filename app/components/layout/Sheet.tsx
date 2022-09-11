import { sortBy, uniq } from 'lodash';
import * as React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Button, Title, useTheme } from 'react-native-paper';
import {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  useBottomSheetDynamicSnapPoints,
  useBottomSheet,
  BottomSheetView,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import useKeyboardVisibility from 'app/hooks/useKeyboardVisibility';

interface IBottomSheetProps {
  name?: string;
  open?: boolean;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  scrollable?: boolean;
  disablePadding?: boolean;
  snapPoints?: (string | number)[];
  handleStyles?: ViewProps['style'];
  buttonAction?(): void;
  onClose(): void;
}

function BottomSheetWrapper({
  open,
  children,
  initialIndex,
}: {
  initialIndex: number;
  open?: boolean | null;
  children: React.ReactNode;
}) {
  const { snapToIndex, forceClose, expand, snapToPosition } = useBottomSheet();
  React.useEffect(() => {
    if (open) {
      console.log('Opening', open);
      expand();
      snapToPosition(400);
      snapToIndex(initialIndex);
    } else {
      console.log('Closing', open);
      forceClose();
    }
  }, [expand, forceClose, initialIndex, open, snapToIndex, snapToPosition]);

  console.log('Wrapper open', open);

  return children as JSX.Element;
}
export default function DialogOrSheet(props: IBottomSheetProps) {
  const {
    name,
    open,
    snapPoints,
    onClose,
    scrollable,
    title,
    buttonLabel,
    buttonAction,
    loading,
    handleStyles,
    disablePadding,
    children,
  } = props;
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const points = React.useMemo(
    () => sortBy(uniq([0, ...(snapPoints || [600])])).filter((s) => s !== 0),
    [snapPoints]
  );
  const snappingPoints = useBottomSheetDynamicSnapPoints(points);

  const keyboardVisible = useKeyboardVisibility();

  const memoizedClose = React.useMemo(() => onClose, [onClose]);

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => memoizedClose());
    });
  }, [memoizedClose]);

  const theme = useTheme();
  const HandleComponent = React.useCallback(() => {
    return !title ? (
      <View
        style={StyleSheet.flatten([
          styles.sheetHeader,
          { shadowColor: theme.colors.onSurface, backgroundColor: theme.colors.surface },
          handleStyles,
        ])}
      >
        <View style={styles.handle} />
      </View>
    ) : (
      <View
        style={[
          styles.sheetHeaderWithTitle,
          {
            shadowColor: theme.colors.onSurface,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <View style={styles.handle} />
        <Title>{title}</Title>
      </View>
    );
  }, [handleStyles, theme.colors.onSurface, theme.colors.surface, title]);

  const Backdrop = React.useCallback(
    (p: BottomSheetBackdropProps) => <BottomSheetBackdrop {...p} pressBehavior="close" />,
    []
  );

  console.log('Sheet open', open, points, snappingPoints.animatedSnapPoints);

  return (
    <BottomSheetModal
      {...{ name, onDismiss }}
      enableContentPanningGesture
      enableOverDrag
      enablePanDownToClose
      enableHandlePanningGesture
      ref={sheetRef}
      snapPoints={points}
      handleHeight={snappingPoints.animatedHandleHeight}
      contentHeight={snappingPoints.animatedContentHeight}
      backdropComponent={Backdrop}
      index={(snappingPoints?.animatedSnapPoints.value.length || 1) - 1}
      handleComponent={HandleComponent}
      onChange={console.log}
    >
      <BottomSheetWrapper {...{ open }} initialIndex={(points?.length || 0) - 1}>
        {scrollable !== false ? (
          <BottomSheetScrollView
            onLayout={snappingPoints.handleContentLayout}
            contentContainerStyle={StyleSheet.flatten([
              styles.sheet,
              disablePadding ? styles.noPadding : {},
              { paddingBottom: keyboardVisible ? 400 : 80, backgroundColor: theme.colors.surface },
            ])}
          >
            {children}
            <View style={styles.buttonContainer}>
              <Button
                onPress={buttonAction}
                mode="contained"
                style={styles.button}
                loading={loading}
              >
                {buttonLabel}
              </Button>
            </View>
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView onLayout={snappingPoints.handleContentLayout}>
            {children}
            <View style={styles.buttonContainer}>
              <Button
                onPress={buttonAction}
                mode="contained"
                style={styles.button}
                loading={loading}
              >
                {buttonLabel}
              </Button>
            </View>
          </BottomSheetView>
        )}
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    padding: 5,
    alignSelf: 'flex-end',
    borderRadius: 20,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  noPadding: { paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#AAAAAA',
    alignSelf: 'center',
  },
  sheet: {
    paddingBottom: 30,
    paddingHorizontal: 16,
    elevation: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sheetHeader: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 40,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sheetHeaderWithTitle: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    paddingLeft: 16,
    paddingTop: 16,
  },
});
