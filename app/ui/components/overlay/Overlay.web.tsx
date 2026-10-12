import * as React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import * as Dialog from '@rn-primitives/dialog';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import IconButton from '../IconButton';
import Text from '../Text';
import type { OverlayProps } from './Overlay';
import { resolvePresentation } from './presentation';

export type { OverlayProps } from './Overlay';

const DIALOG_WIDTH = 560;
const PANEL_WIDTH = 400;
const LAYER = 1000;

/** `position: fixed` and CSS lengths are web-only values that React Native's types do not know */
const web = (style: object) => style as ViewStyle;

/**
 * The one overlay of the app, on the web: `@rn-primitives/dialog` (Radix) gives it `role="dialog"` named by its title,
 * a focus trap, Escape to close, and focus returned to what had it when it opened. A sheet is anchored to the bottom, a
 * panel to the right, a dialog is centred.
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
  const kind = resolvePresentation(presentation, { breakpoint: theme.breakpoint, native: false });
  // Opened from outside (a state, not a trigger inside the dialog), so Radix does not know what to give focus back to
  const opener = React.useRef<HTMLElement | null>(null);

  const placement: ViewStyle =
    kind === 'panel'
      ? web({
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          width: `min(${PANEL_WIDTH}px, 100%)`,
        })
      : kind === 'sheet'
        ? web({
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: '90%',
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
          })
        : web({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `min(${DIALOG_WIDTH}px, calc(100% - ${2 * theme.space.lg}px))`,
            maxHeight: '90%',
            borderRadius: theme.radius.lg,
          });

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={web({
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: LAYER,
            backgroundColor: theme.colour.scrim,
          })}
        />
        <Dialog.Content
          testID={testID}
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            opener.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event: Event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
          style={{
            ...placement,
            zIndex: LAYER + 1,
            backgroundColor: theme.colour.surface,
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
            <View
              style={
                showTitle
                  ? { flexShrink: 1 }
                  : { position: 'absolute', width: 1, height: 1, overflow: 'hidden' }
              }
            >
              <Dialog.Title asChild>
                <Text variant="title" role="heading" aria-level={2} numberOfLines={2}>
                  {title}
                </Text>
              </Dialog.Title>
            </View>
            <Dialog.Close asChild>
              <IconButton icon="close" aria-label={t('overlay.close')} />
            </Dialog.Close>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
