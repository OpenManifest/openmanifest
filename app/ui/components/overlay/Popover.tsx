import * as React from 'react';
import { Modal, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import useOpenState from './useOpenState';

export type PopoverProps = {
  /** The pressable that opens it (a `Button`, an `IconButton`): it gets `onPress` and, on the web, its ARIA state */
  trigger: React.ReactElement<{ onPress?: () => void }>;
  /** Names the popover for screen readers */
  label: string;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  open?: boolean;
  onOpenChange?(open: boolean): void;
  /** Which edge of the trigger it lines up with on the web */
  align?: 'start' | 'center' | 'end';
  /** No padding around the content (a list of rows that run to the edge) */
  flush?: boolean;
  testID?: string;
};

/**
 * Content over the page, next to what opened it. On the web it is `@rn-primitives/popover` (`Popover.web.tsx`): it
 * opens with Enter, closes with Escape and returns focus to the trigger. On native it is a card in a modal over a
 * dimmed screen; the back gesture or a tap outside closes it.
 */
export default function Popover({
  trigger,
  label,
  children,
  open,
  onOpenChange,
  flush = false,
  testID,
}: PopoverProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [visible, setVisible] = useOpenState(open, onOpenChange);
  const close = React.useCallback(() => setVisible(false), [setVisible]);

  return (
    <>
      {React.cloneElement(trigger, { onPress: () => setVisible(true) })}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Tappable
            role="button"
            aria-label={t('overlay.close')}
            minTarget={false}
            onPress={close}
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
            aria-label={label}
            aria-modal
            testID={testID}
            style={{
              width: '90%',
              maxWidth: 320,
              padding: flush ? 0 : theme.space.lg,
              borderRadius: theme.radius.lg,
              overflow: 'hidden',
              backgroundColor: theme.colour.surface,
              ...theme.elevation.overlay,
            }}
          >
            {typeof children === 'function' ? children(close) : children}
          </View>
        </View>
      </Modal>
    </>
  );
}
