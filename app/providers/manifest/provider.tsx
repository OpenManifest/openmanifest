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
import ManifestGroupDialog from 'app/forms/manifest_group';
import type { IManifestGroupInitial } from 'app/forms/manifest_group';
import { useDropzoneContext } from '../dropzone/context';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
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

function ManifestGroupDialogWrapper() {
  const { dialogs } = useManifestContext();
  const { manifestGroup } = dialogs;
  return (
    <ManifestGroupDialog
      onClose={manifestGroup.close}
      open={manifestGroup.visible}
      {...manifestGroup.state}
    />
  );
}

const useManifestUserDialog = createUseDialog<Pick<IManifestUserDialog, 'load' | 'slot'>>();
const useLoadDialog = createUseDialog<Pick<ILoadDialog, 'load'>>();
const useCreditsDialog = createUseDialog<Pick<ICreditsSheet, 'dropzoneUser'>>();
const useManifestGroupDialog = createUseDialog<IManifestGroupInitial>();

export function ManifestContextProvider(props: React.PropsWithChildren<UseManifestOptions>) {
  const { dropzone, date = DateTime.local().toISODate(), children } = props;
  const manifestUserDialog = useManifestUserDialog();
  const loadDialog = useLoadDialog();
  const creditsDialog = useCreditsDialog();
  const manifestGroupDialog = useManifestGroupDialog();
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  const manifest = useManifest({ dropzone, date });

  const { permissions } = manifest;

  const dialogs = React.useMemo(
    () => ({
      manifestUser: manifestUserDialog,
      load: permissions.canCreateLoad ? loadDialog : { ...loadDialog, open: noop },
      credits: permissions.canAddTransaction ? creditsDialog : { ...creditsDialog, open: noop },
      manifestGroup: {
        ...manifestGroupDialog,
        // Someone who can only manifest a group with themselves in it starts with themselves in it
        open: (state?: IManifestGroupInitial) =>
          manifestGroupDialog.open({
            ...state,
            users:
              state?.users ??
              (state?.slots === undefined &&
              canManifestGroupWithSelfOnly &&
              !canManifestGroup &&
              currentUser
                ? [currentUser]
                : undefined),
          } as IManifestGroupInitial),
      },
    }),
    [
      manifestUserDialog,
      permissions.canCreateLoad,
      loadDialog,
      permissions.canAddTransaction,
      creditsDialog,
      manifestGroupDialog,
      canManifestGroup,
      canManifestGroupWithSelfOnly,
      currentUser,
    ]
  );

  const context = React.useMemo(() => ({ manifest, dialogs }), [manifest, dialogs]);

  return (
    <ManifestContext.Provider value={context}>
      {children}
      <CreditsDialogWrapper />
      <LoadDialogWrapper />
      <ManifestUserDialogWrapper />
      <ManifestGroupDialogWrapper />
    </ManifestContext.Provider>
  );
}

export { useManifest };
