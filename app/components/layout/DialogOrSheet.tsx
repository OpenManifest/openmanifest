import * as React from 'react';
import { Button, Overlay } from 'app/ui';

interface IBottomSheetProps {
  open?: boolean;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  disablePadding?: boolean;
  /** Ignored: the overlay scrolls its content */
  scrollable?: boolean;
  handle?: React.ReactNode;

  buttonAction?(): void;
  onClose(): void;
}

/**
 * A form with one action button below it, in the overlay of `app/ui`: a bottom sheet on a phone, a side panel on a wide
 * window, a dialog elsewhere. Call sites keep the props they always had.
 */
export default function DialogOrSheet({
  open,
  disablePadding,
  onClose,
  title,
  buttonLabel,
  buttonAction,
  handle,
  loading,
  children,
}: IBottomSheetProps) {
  return (
    <Overlay
      open={!!open}
      onClose={onClose}
      title={title ?? buttonLabel ?? ''}
      showTitle={!!title}
      testID="form-dialog"
      handle={handle}
      disablePadding={disablePadding}
      footer={
        <Button
          label={buttonLabel ?? ''}
          fullWidth
          loading={loading}
          disabled={!buttonAction}
          onPress={buttonAction}
        />
      }
    >
      {children}
    </Overlay>
  );
}
