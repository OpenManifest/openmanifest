import * as React from 'react';
import ManifestUserDialog from 'app/forms/manifest_user/Dialog';
import LoadDialog from 'app/forms/load/Dialog';
import { LoadsQueryVariables } from '../../operations';
import { ManifestProvider, useManifestContext } from './Context';

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

function LoadDialogWrapper() {
  const { dialogs } = useManifestContext();
  const { load } = dialogs;
  return (
    <LoadDialog onClose={load.close} onSuccess={load.close} open={load.visible} {...load.state} />
  );
}

export default function Provider(props: React.PropsWithChildren<UseManifestOptions>) {
  const { children, ...rest } = props;

  return (
    <ManifestProvider {...rest}>
      {children}
      <LoadDialogWrapper />
      <ManifestUserDialogWrapper />
    </ManifestProvider>
  );
}
