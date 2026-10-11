import * as React from 'react';
import { View } from 'react-native-animatable';
import { Button } from 'react-native-paper';

import { DropzoneUserProfileFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import RigCard from '../../equipment/RigCard';
import { useProfileDialogs } from '../ProfileDialogs';

export interface IJumpHistoryTab {
  dropzoneUser?: DropzoneUserProfileFragment | null;
  tabIndex: number;
  currentTabIndex: number;
}
export default function EquipmentTab(props: IJumpHistoryTab) {
  const { dropzoneUser, tabIndex, currentTabIndex } = props;
  const { editRig } = useProfileDialogs();
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const canCreateRig = useRestriction(Permission.CreateRig);
  const canUpdateUser = useRestriction(Permission.UpdateUser);

  // Members manage their own rigs; staff with UpdateUser run a member's rigs from the office (UB.2)
  const isSelf = !!currentUser?.id && currentUser.id === dropzoneUser?.id;
  const canManage = (isSelf && canCreateRig) || canUpdateUser;

  return (
    <View
      animation={currentTabIndex < tabIndex ? 'slideInRight' : 'slideInLeft'}
      duration={200}
      easing="ease-in-out"
      style={{ padding: 8 }}
    >
      {canManage ? (
        <Button
          testID="profile-add-rig"
          icon="plus"
          mode="outlined"
          style={{ alignSelf: 'flex-start', marginVertical: 8 }}
          onPress={() => editRig()}
        >
          Add rig
        </Button>
      ) : null}
      {dropzoneUser?.user?.rigs?.map((item) => (
        <RigCard
          key={item.id}
          {...{ dropzoneUser }}
          onSuccessfulImageUpload={() => null}
          rig={item}
          rigInspection={dropzoneUser?.rigInspections?.find(
            (insp) => insp.rig?.id === item.id && insp.isOk
          )}
          onPress={
            canManage
              ? () => {
                  editRig(item);
                }
              : undefined
          }
        />
      ))}
    </View>
  );
}
