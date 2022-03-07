import { sortBy, uniq } from 'lodash';
import * as React from 'react';
import { View, StyleSheet, Keyboard, ViewProps } from 'react-native';
import { Button, Title, useTheme } from 'react-native-paper';
import {
  BottomSheetModal,
  enableLogging,
  BottomSheetScrollView,
  useBottomSheetDynamicSnapPoints,
  useBottomSheet,
  BottomSheetView,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';

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

enableLogging();

export function BottomSheetWrapper({
  open,
  children,
}: {
  open?: boolean | null;
  children: React.ReactNode;
}) {
  console.log('Rendering bottom sheet');
  const { snapToIndex, collapse, animatedIndex } = useBottomSheet();
  const { dismissAll } = useBottomSheetModal();
  React.useEffect(() => {
    if (open) {
      console.log('-- Opening', 0);
      snapToIndex(0);
      // collapse();
    } else {
      console.log('-- Dismissing');
      dismissAll();
    }
  }, [collapse, dismissAll, open, snapToIndex]);

  console.log('Wrapper open', open, animatedIndex);

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
  const [index, onChange] = React.useState(-1);
  const snappingPoints = useBottomSheetDynamicSnapPoints(points);
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  const onKeyboardVisible = () => setKeyboardVisible(true);
  const onKeyboardHidden = () => setKeyboardVisible(false);

  React.useEffect(() => {
    Keyboard.addListener('keyboardDidShow', onKeyboardVisible);
    Keyboard.addListener('keyboardDidHide', onKeyboardHidden);

    return () => {
      Keyboard.removeListener('keyboardDidShow', onKeyboardVisible);
      Keyboard.removeListener('keyboardDidHide', onKeyboardHidden);
    };
  }, []);

  const onDismiss = React.useCallback(() => {
    console.log('Dismissed');
    requestAnimationFrame(onClose);
  }, [onClose]);

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log('-- Effect opening snapping sheet', name, sheetRef?.current, points.length - 1);
      sheetRef?.current?.snapToIndex(points.length - 1);
    }
  }, [name, open, points.length]);

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

  console.log('Dialog ', open);

  return (
    <BottomSheetModal
      {...{ onDismiss, index, onChange }}
      enableContentPanningGesture
      enableOverDrag
      enablePanDownToClose
      enableHandlePanningGesture
      enableDismissOnClose
      ref={sheetRef}
      snapPoints={points}
      onAnimate={console.log}
      handleHeight={snappingPoints.animatedHandleHeight}
      contentHeight={snappingPoints.animatedContentHeight}
      handleComponent={HandleComponent}
    >
      {scrollable !== false ? (
        <BottomSheetScrollView
          onLayout={snappingPoints.handleContentLayout}
          contentContainerStyle={StyleSheet.flatten([
            styles.sheet,
            disablePadding ? styles.noPadding : {},
            {
              paddingBottom: keyboardVisible ? 400 : 80,
              backgroundColor: theme.colors.surface,
            },
          ])}
        >
          {children}
          <View style={styles.buttonContainer}>
            <Button onPress={buttonAction} mode="contained" style={styles.button} loading={loading}>
              {buttonLabel}
            </Button>
          </View>
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView onLayout={snappingPoints.handleContentLayout}>
          {children}
          <View style={styles.buttonContainer}>
            <Button onPress={buttonAction} mode="contained" style={styles.button} loading={loading}>
              {buttonLabel}
            </Button>
          </View>
        </BottomSheetView>
      )}
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
