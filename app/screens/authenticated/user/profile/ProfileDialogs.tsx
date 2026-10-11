import * as React from 'react';
import noop from 'lodash/noop';
import type { DropzoneUserProfileFragment, RigEssentialsFragment } from 'app/api/operations';
import DropzoneUserDialog from 'app/forms/dropzone_user';
import RigDialog from 'app/forms/rig';
import UserDialog from 'app/forms/user';
import createUseDialog from 'app/providers/hooks/useDialog';

type ProfileDialogs = {
  /** Edit the member's name, contact details and licence */
  editUser(): void;
  /** Edit the member's access level and membership expiry */
  editMembership(): void;
  /** Edit a rig, or add one when none is given */
  editRig(rig?: RigEssentialsFragment): void;
};

const ProfileDialogsContext = React.createContext<ProfileDialogs>({
  editUser: noop,
  editMembership: noop,
  editRig: noop,
});

const useUserDialog = createUseDialog<object>();
const useMembershipDialog = createUseDialog<object>();
const useRigDialog = createUseDialog<{ rig?: RigEssentialsFragment }>();

/** Mounts the sheets a profile can open once, so any part of the profile can open them. */
export function ProfileDialogsProvider(
  props: React.PropsWithChildren<{ dropzoneUser?: DropzoneUserProfileFragment | null }>
) {
  const { dropzoneUser, children } = props;
  const userDialog = useUserDialog();
  const membershipDialog = useMembershipDialog();
  const rigDialog = useRigDialog();

  const { open: openUserDialog } = userDialog;
  const { open: openMembershipDialog } = membershipDialog;
  const { open: openRigDialog } = rigDialog;
  const dialogs = React.useMemo<ProfileDialogs>(
    () => ({
      editUser: () => openUserDialog({}),
      editMembership: () => openMembershipDialog({}),
      editRig: (rig) => openRigDialog({ rig }),
    }),
    [openUserDialog, openMembershipDialog, openRigDialog]
  );

  return (
    <ProfileDialogsContext.Provider value={dialogs}>
      {children}
      <RigDialog
        open={rigDialog.visible}
        rig={rigDialog.state?.rig}
        userId={Number(dropzoneUser?.user?.id)}
        onClose={rigDialog.close}
      />
      <DropzoneUserDialog
        open={membershipDialog.visible}
        dropzoneUser={dropzoneUser}
        onClose={membershipDialog.close}
      />
      <UserDialog
        open={userDialog.visible}
        dropzoneUser={dropzoneUser}
        onClose={userDialog.close}
      />
    </ProfileDialogsContext.Provider>
  );
}

export function useProfileDialogs() {
  return React.useContext(ProfileDialogsContext);
}
