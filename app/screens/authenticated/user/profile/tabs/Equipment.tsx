import * as React from 'react';
import { View } from 'react-native-animatable';

import { DropzoneUserProfileFragment } from 'app/api/operations';
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
  return (
    <View
      animation={currentTabIndex < tabIndex ? 'slideInRight' : 'slideInLeft'}
      duration={200}
      easing="ease-in-out"
      style={{ padding: 8 }}
    >
      {dropzoneUser?.user?.rigs?.map((item) => (
        <RigCard
          {...{ dropzoneUser }}
          onSuccessfulImageUpload={() => null}
          rig={item}
          rigInspection={dropzoneUser?.rigInspections?.find(
            (insp) => insp.rig?.id === item.id && insp.isOk
          )}
          onPress={() => {
            editRig(item);
          }}
        />
      ))}
    </View>
  );
}
