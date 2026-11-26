import * as React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import * as Dialog from '@rn-primitives/dialog';
import { useTranslation } from 'react-i18next';
import { cssDuration, cssEasing, overlayTransition } from '../../motion/transitions';
import { useReduceMotion } from '../../motion/useReduceMotion';
import { motion } from '../../tokens/motion';
import { space } from '../../tokens/space';
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

/** A CSS animation (react-native-web compiles `animationKeyframes` to `@keyframes`) */
const enter = (duration: number, from: object, to: object) =>
  web({
    animationKeyframes: [{ from, to }],
    animationDuration: cssDuration(duration),
    animationTimingFunction: cssEasing,
  });

/**
 * How each kind comes in: the scrim fades, a sheet slides up, a panel slides in from the end, a dialog rises a little
 * into the centre (movement, not opacity: text fading in would be below contrast while it does). Radix unmounts them
 * at once when they close. The animations sit on inner views: Radix merges the style of its own parts as one object.
 */
const transitions = StyleSheet.create({
  scrim: enter(motion.base, { opacity: 0 }, { opacity: 1 }),
  sheet: enter(
    overlayTransition('sheet', false).duration,
    { transform: 'translateY(100%)' },
    { transform: 'translateY(0)' }
  ),
  panel: enter(
    overlayTransition('panel', false).duration,
    { transform: 'translateX(100%)' },
    { transform: 'translateX(0)' }
  ),
  dialog: enter(
    overlayTransition('dialog', false).duration,
    { transform: `translateY(${space.lg}px)` },
    { transform: 'translateY(0)' }
  ),
});

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
  // With reduced motion (the browser's `prefers-reduced-motion`) it appears at once
  const animate = !useReduceMotion();
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
          })
        : web({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `min(${DIALOG_WIDTH}px, calc(100% - ${2 * theme.space.lg}px))`,
            maxHeight: '90%',
          });
  const shape: ViewStyle =
    kind === 'panel'
      ? {}
      : kind === 'sheet'
        ? { borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg }
        : { borderRadius: theme.radius.lg };

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
          })}
        >
          <View
            style={[
              animate ? transitions.scrim : null,
              { flex: 1, backgroundColor: theme.colour.scrim },
            ]}
          />
        </Dialog.Overlay>
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
          style={{ ...placement, zIndex: LAYER + 1 }}
        >
          <View
            style={[
              animate ? transitions[kind] : null,
              {
                flexGrow: kind === 'panel' ? 1 : 0,
                flexShrink: 1,
                backgroundColor: theme.colour.surface,
                ...shape,
                ...theme.elevation.overlay,
              },
            ]}
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
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
