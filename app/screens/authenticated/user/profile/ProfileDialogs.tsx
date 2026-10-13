import * as React from 'react';
import noop from 'lodash/noop';
import type { MembershipProfileFragment, EquipmentEssentialsFragment } from 'app/api/operations';
import MembershipDialog from 'app/forms/membership';
import EquipmentDialog from 'app/forms/equipment';
import UserDialog from 'app/forms/user';
import createUseDialog from 'app/providers/hooks/useDialog';

type ProfileDialogs = {
  /** Edit the member's name, contact details and licence */
  editUser(): void;
  /** Edit the member's access level and membership expiry */
  editMembership(): void;
  /** Edit a equipment, or add one when none is given */
  editEquipment(equipment?: EquipmentEssentialsFragment): void;
};

const ProfileDialogsContext = React.createContext<ProfileDialogs>({
  editUser: noop,
  editMembership: noop,
  editEquipment: noop,
});

const useUserDialog = createUseDialog<object>();
const useMembershipDialog = createUseDialog<object>();
const useEquipmentDialog = createUseDialog<{ equipment?: EquipmentEssentialsFragment }>();

/** Mounts the sheets a profile can open once, so any part of the profile can open them. */
export function ProfileDialogsProvider(
  props: React.PropsWithChildren<{ membership?: MembershipProfileFragment | null }>
) {
  const { membership, children } = props;
  const userDialog = useUserDialog();
  const membershipDialog = useMembershipDialog();
  const equipmentDialog = useEquipmentDialog();

  const { open: openUserDialog } = userDialog;
  const { open: openMembershipDialog } = membershipDialog;
  const { open: openEquipmentDialog } = equipmentDialog;
  const dialogs = React.useMemo<ProfileDialogs>(
    () => ({
      editUser: () => openUserDialog({}),
      editMembership: () => openMembershipDialog({}),
      editEquipment: (equipment) => openEquipmentDialog({ equipment }),
    }),
    [openUserDialog, openMembershipDialog, openEquipmentDialog]
  );

  return (
    <ProfileDialogsContext.Provider value={dialogs}>
      {children}
      <EquipmentDialog
        open={equipmentDialog.visible}
        equipment={equipmentDialog.state?.equipment}
        userId={Number(membership?.user?.id)}
        onClose={equipmentDialog.close}
      />
      <MembershipDialog
        open={membershipDialog.visible}
        membership={membership}
        onClose={membershipDialog.close}
      />
      <UserDialog open={userDialog.visible} membership={membership} onClose={userDialog.close} />
    </ProfileDialogsContext.Provider>
  );
}

export function useProfileDialogs() {
  return React.useContext(ProfileDialogsContext);
}
