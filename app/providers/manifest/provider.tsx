import * as React from 'react';
import type { IManifestUserDialog } from 'app/forms/manifest_user/Dialog';
import type { ILoadDialog } from 'app/forms/load/Dialog';
import type { ICreditsSheet } from 'app/forms/credits/Credits';
import noop from 'lodash/noop';
import { LoadsQueryVariables } from 'app/api/operations';
import { useManifest } from 'app/api/crud/useManifest';
import ManifestUserDialog from 'app/forms/manifest_user/Dialog';
import LoadDialog from 'app/forms/load/Dialog';
import CreditSheet from 'app/forms/credits/Credits';
import { DateTime } from 'luxon';
import createUseDialog from '../hooks/useDialog';
import { ManifestContext, useManifestContext } from './context';

export type UseManifestOptions = Partial<LoadsQueryVariables>;

function ManifestUserDialogWrapper() {
  const { dialogs } = useManifestContext();
  const { manifestUser } = dialogs;
  return (
    <ManifestUserDialog
      onClose={manifestUser.close}
      onSuccess={manifestUser.close}
      open={manifestUser.visible}
      {...manifestUser.state}
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

function CreditsDialogWrapper() {
  const { dialogs } = useManifestContext();
  const { credits } = dialogs;
  return (
    <CreditSheet
      onClose={credits.close}
      onSuccess={credits.close}
      open={credits.visible}
      {...credits.state}
    />
  );
}

const useManifestUserDialog = createUseDialog<Pick<IManifestUserDialog, 'load' | 'slot'>>();
const useLoadDialog = createUseDialog<Pick<ILoadDialog, 'load'>>();
const useCreditsDialog = createUseDialog<Pick<ICreditsSheet, 'dropzoneUser'>>();

export function ManifestContextProvider(props: React.PropsWithChildren<UseManifestOptions>) {
  const { dropzone, date = DateTime.local().toISODate(), children } = props;
  const manifestUserDialog = useManifestUserDialog();
  const loadDialog = useLoadDialog();
  const creditsDialog = useCreditsDialog();

  const manifest = useManifest({ dropzone, date });

  const { permissions } = manifest;

  const dialogs = React.useMemo(
    () => ({
      manifestUser: manifestUserDialog,
      load: permissions.canCreateLoad ? loadDialog : { ...loadDialog, open: noop },
      credits: permissions.canAddTransaction ? creditsDialog : { ...creditsDialog, open: noop },
    }),
    [
      manifestUserDialog,
      permissions.canCreateLoad,
      loadDialog,
      permissions.canAddTransaction,
      creditsDialog,
    ]
  );

  const context = React.useMemo(() => ({ manifest, dialogs }), [manifest, dialogs]);

  return (
    <ManifestContext.Provider value={context}>
      {children}
      <CreditsDialogWrapper />
      <LoadDialogWrapper />
      <ManifestUserDialogWrapper />
    </ManifestContext.Provider>
  );
}

export { useManifest };
