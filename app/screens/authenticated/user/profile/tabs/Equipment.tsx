import * as React from 'react';
import { FlatList } from 'react-native';
import { Card } from 'react-native-paper';

import { DropzoneUserProfileFragment } from 'app/api/operations';
import { actions, useAppDispatch } from 'app/state';

import RigCard from '../../equipment/RigCard';

export interface IJumpHistoryTab {
  dropzoneUser?: DropzoneUserProfileFragment | null;
}
export default function EquipmentTab(props: IJumpHistoryTab) {
  const { dropzoneUser } = props;
  const dispatch = useAppDispatch();
  return (
    <Card style={{ marginHorizontal: 0 }} elevation={1}>
      <FlatList
        data={dropzoneUser?.user?.rigs || []}
        numColumns={1}
        style={{ flex: 1 }}
        scrollEnabled={false}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <RigCard
            {...{ dropzoneUser }}
            onSuccessfulImageUpload={() => null}
            rig={item}
            rigInspection={dropzoneUser?.rigInspections?.find(
              (insp) => insp.rig?.id === item.id && insp.isOk
            )}
            onPress={() => {
              dispatch(actions.forms.rig.setOpen(item));
            }}
          />
        )}
      />
    </Card>
  );
}
