import * as React from 'react';
import ManifestUserDialog from 'app/forms/manifest_user';
import { LoadsQueryVariables } from '../../operations';
import { ManifestProvider, useManifestContext } from './useManifest';

export type UseManifestOptions = Partial<LoadsQueryVariables>;

function ManifestUserDialogWrapper() {
  const { dialogs } = useManifestContext();
  const { user } = dialogs;
  return (
    <ManifestUserDialog
      onClose={user.close}
      onSuccess={user.close}
      open={user.visible}
      {...user.state}
    />
  );
}

export default function Provider(props: React.PropsWithChildren<UseManifestOptions>) {
  const { children, ...rest } = props;

  return (
    <ManifestProvider {...rest}>
      {children}
      <ManifestUserDialogWrapper />
    </ManifestProvider>
  );
}
