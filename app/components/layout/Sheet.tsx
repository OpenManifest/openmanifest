import * as React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Title, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { SheetContext } from './SheetContext';

export interface ISheetProps {
  open?: boolean;
  /** Called after the sheet has been dismissed, by the user or because `open` became false */
  onClose(): void;
  title?: string;
  /** Replaces the grab handle, e.g. with tabs */
  handle?: React.ReactNode;
  /** Padding and a background for the content of a sheet without a title */
  disablePadding?: boolean;
  /** Rendered at the top of the scrolling content */
  header?: React.ReactNode;
  name?: string;
  testID?: string;
  children?: React.ReactNode;
}

/** Room left above a full height sheet */
const TOP_MARGIN = 16;

function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
}

/**
 * The one bottom sheet of the app: sizes to its content (scrolling when taller than the screen), moves above the
 * keyboard, keeps the content above the gesture bar. Text inputs in the content must be `BottomSheetTextInput`s, which
 * the app's `TextField` and `NumberField` are while inside a `Sheet`.
 */
export default function Sheet(props: ISheetProps) {
  const { open, onClose, title, handle, disablePadding, header, name, testID, children } = props;
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => onClose());
    });
  }, [onClose]);

  React.useEffect(() => {
    if (open) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss({ duration: 300 });
    }
  }, [open]);

  const HandleComponent = React.useCallback(
    () => (
      <View
        style={[
          title ? styles.headerWithTitle : styles.header,
          {
            overflow: handle ? 'hidden' : undefined,
            shadowColor: theme.colors.onSurface,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {handle ?? <View style={styles.handle} />}
        {title ? <Title style={styles.title}>{title}</Title> : null}
      </View>
    ),
    [handle, theme.colors.onSurface, theme.colors.surface, title]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      name={name}
      enableDynamicSizing
      maxDynamicContentSize={height - insets.top - TOP_MARGIN}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={Backdrop}
      handleComponent={HandleComponent}
      onDismiss={onDismiss}
    >
      <SheetContext.Provider value>
        <BottomSheetScrollView
          testID={testID}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            disablePadding ? styles.noPadding : null,
            { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 24 },
          ]}
        >
          {header}
          {children}
        </BottomSheetScrollView>
      </SheetContext.Provider>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  noPadding: { paddingHorizontal: 0, paddingTop: 0 },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#AAAAAA',
    alignSelf: 'center',
  },
  header: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: 40,
    paddingTop: 4,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  headerWithTitle: {
    zIndex: 10000,
    elevation: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    minHeight: 56,
    paddingLeft: 16,
    paddingTop: 4,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  title: {
    marginTop: 8,
  },
});
