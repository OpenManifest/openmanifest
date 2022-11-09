import { useDropzoneContext } from 'app/api/crud';
import { LoadEssentialsFragment, SlotDetailsFragment } from 'app/api/operations';
import * as React from 'react';
import type { IManifestUserDialog } from './Dialog';

export default function useManifestUserDialog() {
  const [state, setState] = React.useState<Pick<IManifestUserDialog, 'load' | 'slot'>>();
  const { currentUser } = useDropzoneContext();
  const open = React.useCallback(
    (load: Pick<LoadEssentialsFragment, 'id' | 'loadNumber'>, slot?: SlotDetailsFragment) => {
      setState({ slot: slot || { dropzoneUser: currentUser }, load });
    },
    [currentUser]
  );
  const close = React.useCallback(() => setState(undefined), []);

  return { state, visible: !!state, open, close };
}
