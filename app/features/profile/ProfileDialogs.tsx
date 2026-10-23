import * as React from 'react';
import noop from 'lodash/noop';
import type { EquipmentEssentialsFragment, MembershipDetailsFragment } from 'app/api/operations';
import type { Permission } from 'app/api/schema.d';
import MembershipDialog from 'app/forms/membership';
import EquipmentDialog from 'app/forms/equipment';
import UserDialog from 'app/forms/user';
import createUseDialog from 'app/providers/hooks/useDialog';

type ProfileDialogs = {
  /** Edit the member's name, contact details, body mass and certification level */
  editUser(): void;
  /** Edit the member's role, membership expiry and acting permissions */
  editMembership(): void;
  /** Edit an item of equipment, or add one when none is given */
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

export type ProfileDialogsProviderProps = React.PropsWithChildren<{
  membership?: (MembershipDetailsFragment & { permissions?: Permission[] | null }) | null;
  /** Something was saved: the profile asks again for what the server works out (eligibility) */
  onChanged?(): void;
}>;

/** Mounts the forms a profile can open once, so any section of the profile can open them */
export function ProfileDialogsProvider({
  membership,
  onChanged,
  children,
}: ProfileDialogsProviderProps) {
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
        onSuccess={onChanged}
      />
      <MembershipDialog
        open={membershipDialog.visible}
        membership={membership}
        permissions={membership?.permissions}
        onClose={membershipDialog.close}
        onSuccess={() => onChanged?.()}
      />
      <UserDialog
        open={userDialog.visible}
        membership={membership}
        onClose={userDialog.close}
        onSuccess={onChanged}
      />
    </ProfileDialogsContext.Provider>
  );
}

export function useProfileDialogs() {
  return React.useContext(ProfileDialogsContext);
}
