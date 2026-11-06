import * as React from 'react';
import { Modal, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Sheet from 'app/components/layout/Sheet';
import { useTheme } from '../../theme';
import IconButton from '../IconButton';
import Tappable from '../../Tappable';
import Text from '../Text';
import { resolvePresentation, type Presentation } from './presentation';

export type OverlayProps = {
  open: boolean;
  /** Called when the person closes it (the close button, the backdrop, Escape, the back gesture) */
  onClose(): void;
  /** Names the overlay for screen readers and heads it */
  title: string;
  /** Show the title (default); `false` keeps it as the name only, for a form whose button says it all */
  showTitle?: boolean;
  /** `auto` picks a bottom sheet on a native phone, a side panel on a wide window, a dialog elsewhere */
  presentation?: Presentation;
  /** Pinned below the content, which scrolls: the buttons of a form */
  footer?: React.ReactNode;
  /** Under the title, above the scrolling content and pinned with the title: tabs, a step header. On a sheet it takes the place of the drag handle */
  handle?: React.ReactNode;
  /** The content runs to the edges (a list of rows, a map) */
  disablePadding?: boolean;
  testID?: string;
  children?: React.ReactNode;
};

const DIALOG_WIDTH = 560;
const PANEL_WIDTH = 400;

/**
 * The one overlay of the app: a bottom sheet, a dialog or a side panel with a title, a close button, scrolling content
 * and a pinned footer. On the web it traps focus, closes on Escape and returns focus to what opened it
 * (`Overlay.web.tsx`); here, on native, the sheet is the shared `Sheet` and the others a `Modal`.
 */
export default function Overlay({
  open,
  onClose,
  title,
  showTitle = true,
  presentation = 'auto',
  footer,
  handle,
  disablePadding = false,
  testID,
  children,
}: OverlayProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const kind = resolvePresentation(presentation, {
    breakpoint: theme.breakpoint,
    native: Platform.OS !== 'web',
  });

  if (kind === 'sheet') {
    return (
      <Sheet
        open={open}
        onClose={onClose}
        title={showTitle ? title : undefined}
        footer={footer}
        handle={handle}
        disablePadding={disablePadding}
        testID={testID}
      >
        {children}
      </Sheet>
    );
  }

  const panel = kind === 'panel';
  return (
    <Modal
      visible={open}
      transparent
      animationType={panel ? 'slide' : 'fade'}
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: panel ? 'flex-end' : 'center',
          alignItems: panel ? 'stretch' : 'center',
        }}
      >
        <Tappable
          role="button"
          aria-label={t('overlay.close')}
          minTarget={false}
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            start: 0,
            end: 0,
            backgroundColor: theme.colour.scrim,
          }}
        />
        <View
          role="dialog"
          aria-label={title}
          aria-modal
          testID={testID}
          style={{
            width: '100%',
            maxWidth: panel ? PANEL_WIDTH : DIALOG_WIDTH,
            maxHeight: panel ? undefined : '90%',
            backgroundColor: theme.colour.surface,
            borderRadius: panel ? 0 : theme.radius.lg,
            ...theme.elevation.overlay,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingStart: theme.space.lg,
              paddingEnd: theme.space.xs,
              paddingVertical: theme.space.xs,
            }}
          >
            <View style={{ flexShrink: 1 }}>
              {showTitle ? (
                <Text variant="title" role="heading" aria-level={2} numberOfLines={2}>
                  {title}
                </Text>
              ) : null}
            </View>
            <IconButton icon="close" aria-label={t('overlay.close')} onPress={onClose} />
          </View>
          {handle}
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ padding: disablePadding ? 0 : theme.space.lg }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer ? (
            <View
              style={{
                padding: theme.space.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colour.border,
              }}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
