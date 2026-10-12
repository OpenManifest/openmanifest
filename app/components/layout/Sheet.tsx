import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { Text, useTheme } from 'app/ui';
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
  /** Pinned to the bottom of the sheet, above the keyboard and the gesture bar, while the content scrolls */
  footer?: React.ReactNode;
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
  const { open, onClose, title, handle, disablePadding, header, footer, name, testID, children } =
    props;
  const [footerHeight, setFooterHeight] = React.useState(0);
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
        style={{
          zIndex: 10000,
          borderTopLeftRadius: theme.radius.lg,
          borderTopRightRadius: theme.radius.lg,
          minHeight: title ? theme.density.touchTarget + theme.space.sm : theme.space.xxxl,
          paddingTop: theme.space.xs,
          paddingLeft: title ? theme.space.lg : 0,
          overflow: handle ? 'hidden' : undefined,
          backgroundColor: theme.colour.surface,
          ...theme.elevation.raised,
        }}
      >
        {handle ?? (
          <View
            style={{
              width: theme.space.xxl,
              height: theme.space.xs,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colour.border,
              alignSelf: 'center',
            }}
          />
        )}
        {title ? (
          <View style={{ paddingTop: theme.space.sm }}>
            <Text variant="title" role="heading" aria-level={2}>
              {title}
            </Text>
          </View>
        ) : null}
      </View>
    ),
    [handle, theme, title]
  );

  const FooterComponent = React.useCallback(
    (footerProps: BottomSheetFooterProps) => (
      <BottomSheetFooter {...footerProps} bottomInset={0}>
        <View
          onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
          style={{
            backgroundColor: theme.colour.surface,
            paddingHorizontal: theme.space.lg,
            paddingTop: theme.space.sm,
            paddingBottom: insets.bottom + theme.space.sm,
          }}
        >
          {footer}
        </View>
      </BottomSheetFooter>
    ),
    [footer, insets.bottom, theme]
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
      footerComponent={footer ? FooterComponent : undefined}
      backgroundStyle={{ backgroundColor: theme.colour.surface }}
      onDismiss={onDismiss}
    >
      <SheetContext.Provider value>
        <BottomSheetScrollView
          testID={testID}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: disablePadding ? 0 : theme.space.lg,
            paddingTop: disablePadding ? 0 : theme.space.sm,
            backgroundColor: theme.colour.surface,
            paddingBottom: footer ? footerHeight + theme.space.sm : insets.bottom + theme.space.xl,
          }}
        >
          {header}
          {children}
        </BottomSheetScrollView>
      </SheetContext.Provider>
    </BottomSheetModal>
  );
}
