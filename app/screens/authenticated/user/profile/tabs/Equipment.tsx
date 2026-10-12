import * as React from 'react';
import { View } from 'react-native-animatable';
import { Button } from 'react-native-paper';

import { MembershipProfileFragment } from 'app/api/operations';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import RigCard from '../../equipment/RigCard';
import { useProfileDialogs } from '../ProfileDialogs';

export interface IJumpHistoryTab {
  membership?: MembershipProfileFragment | null;
  tabIndex: number;
  currentTabIndex: number;
}
export default function EquipmentTab(props: IJumpHistoryTab) {
  const { membership, tabIndex, currentTabIndex } = props;
  const { editRig } = useProfileDialogs();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const canCreateEquipment = useRestriction(Permission.CreateEquipment);
  const canUpdateUser = useRestriction(Permission.UpdateUser);

  // Members manage their own rigs; staff with UpdateUser run a member's rigs from the office (UB.2)
  const isSelf = !!currentUser?.id && currentUser.id === membership?.id;
  const canManage = (isSelf && canCreateEquipment) || canUpdateUser;

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
      {membership?.user?.rigs?.map((item) => (
        <RigCard
          key={item.id}
          {...{ membership }}
          onSuccessfulImageUpload={() => null}
          rig={item}
          rigInspection={membership?.rigInspections?.find(
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
