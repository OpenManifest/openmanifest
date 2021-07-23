import gql from 'graphql-tag';
import * as React from 'react';
import { ScrollView } from 'react-native';
import { Avatar, Card, TextInput, ProgressBar, Chip, Divider } from 'react-native-paper';
import { createQuery } from '../../../api/createQuery';
import { Query, Rig } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import calculateWingLoading from '../../../utils/calculateWingLoading';
import RigSelect from '../../input/dropdown_select/RigSelect';

interface IUserRigCard {
  dropzoneUserId: number;
  dropzoneId: number;
  exitWeight?: number;
  onChangeExitWeight(weight: number): void;
  rigId?: number;
  onChangeRig(rig: Rig): void;
}

const QUERY_DROPZONE_USERS_MANIFEST_DETAILS = gql`
  query QueryDropzoneUsersManifestDetails($dropzoneId: Int!, $dropzoneUserId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUser(id: $dropzoneUserId) {
        id

        user {
          id
          name
          exitWeight
          license {
            id
            name
          }
          rigs {
            id
            make
            model
            canopySize
          }
        }
        role {
          id
          name
        }
        user {
          id
          name
          image
        }
      }
    }
  }
`;
const useQueryDropzoneUsersDetails = createQuery<
  Query['dropzone']['dropzoneUser'],
  {
    dropzoneId: number;
    dropzoneUserId: number;
  }
>(QUERY_DROPZONE_USERS_MANIFEST_DETAILS, {
  getPayload: (query) => query?.dropzone?.dropzoneUser,
});

export default function UserRigCard(props: IUserRigCard) {
  const { dropzoneId, dropzoneUserId, onChangeRig, exitWeight, rigId, onChangeExitWeight } = props;
  const { global: globalState } = useAppSelector((root) => root);

  const { data, loading } = useQueryDropzoneUsersDetails({
    variables: {
      dropzoneUserId,
      dropzoneId,
    },
    onError: console.error,
  });

  const selectedRig = data?.user?.rigs?.find(({ id }) => Number(id) === rigId);

  React.useEffect(() => {
    if (!exitWeight && data?.user?.exitWeight) {
      onChangeExitWeight(Number(data.user.exitWeight));
    }
  }, [data.user.exitWeight, exitWeight, onChangeExitWeight]);
  return (
    <Card style={{ width: '100%' }} elevation={3}>
      <ProgressBar indeterminate color={globalState.theme.colors.accent} visible={loading} />
      <Card.Title
        title={data?.user.name}
        left={() =>
          data?.user?.image ? (
            <Avatar.Image source={{ uri: data.user.image }} size={24} />
          ) : (
            <Avatar.Icon icon="account" size={24} />
          )
        }
      />

      <Card.Content>
        <Divider style={{ marginBottom: 8 }} />
        <ScrollView horizontal>
          <Chip style={{ marginHorizontal: 1 }} icon="lock" mode="outlined" disabled>
            {data?.role?.name}
          </Chip>
          <Chip style={{ marginHorizontal: 1 }} icon="ticket-account" mode="outlined" disabled>
            {data?.user?.license?.name}
          </Chip>
          {!selectedRig || !exitWeight || !selectedRig.canopySize ? null : (
            <Chip style={{ marginHorizontal: 1 }} icon="escalator-down" mode="outlined" disabled>
              {calculateWingLoading(exitWeight, selectedRig.canopySize!)}
            </Chip>
          )}
        </ScrollView>
        <RigSelect
          userId={dropzoneUserId}
          dropzoneId={dropzoneId}
          onSelect={onChangeRig}
          value={selectedRig}
          autoSelectFirst
        />

        <TextInput
          value={!exitWeight ? '' : `${exitWeight}`}
          onChangeText={(text: string) => onChangeExitWeight(Number(text))}
          keyboardType="number-pad"
          label="Exit weight"
          mode="outlined"
        />
      </Card.Content>
    </Card>
  );
}
