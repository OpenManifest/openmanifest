import * as React from 'react';
import { Button } from 'app/ui';
import type { LoadDetailsFragment } from 'app/api/operations';
import { useManifestContext, useOperatorContext } from 'app/providers';
import MemberPicker from './MemberPicker';
import { canBook } from './booking';

export type BookJumpProps = {
  load: LoadDetailsFragment;
  label: string;
  variant?: 'primary' | 'secondary';
  /** After the picker closed, booked or not */
  onClose?(): void;
  testID?: string;
};

/**
 * "Book a jump": a member books themselves on a load, in the picker in self mode. It is not there when the dropzone has
 * switched off self-manifesting (the member then lacks the permission), the load has left or is full, or the member is
 * already on it.
 */
export default function BookJump({
  load,
  label,
  variant = 'primary',
  onClose,
  testID = 'book-jump',
}: BookJumpProps) {
  const [open, setOpen] = React.useState(false);
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const {
    manifest: { permissions },
  } = useManifestContext();

  if (!permissions.canManifestSelf || !canBook(load, currentUser?.id)) return null;
  return (
    <>
      <Button
        variant={variant}
        icon="plus"
        label={label}
        testID={testID}
        onPress={() => setOpen(true)}
      />
      <MemberPicker
        mode="self"
        load={load}
        open={open}
        testID={`${testID}-picker`}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
      />
    </>
  );
}
