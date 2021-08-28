import gql from 'graphql-tag';
import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
  Avatar,
  Card,
  TextInput,
  ProgressBar,
  Chip,
  Divider,
  List,
  Button,
} from 'react-native-paper';
import { createQuery } from '../../../api/createQuery';
import { DropzoneUser, Query, Rig } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import calculateWingLoading from '../../../utils/calculateWingLoading';
import RigSelect from '../../input/dropdown_select/RigSelect';
import NumberField from '../../input/number_input/NumberField';

interface IUserRigCard {
  dropzoneUserId: number;
  dropzoneId: number;
  exitWeight?: number;
  isTandem?: boolean;
  selectedRig?: Rig;

  passengerName?: string | null;
  passengerWeight?: number | null;
  onRemove?(): void;
  onChangeExitWeight(weight: number): void;
  onChangeRig(rig: Rig): void;
  onChangePassengerName?(name: string): void;
  onChangePassengerWeight?(weight: number): void;
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
            name
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
  getPayload: (query) => query?.dropzone?.dropzoneUser as DropzoneUser | null,
});

export default function UserRigCard(props: IUserRigCard) {
  const {
    dropzoneId,
    dropzoneUserId,
    onChangeRig,
    exitWeight,
    selectedRig,
    isTandem,
    passengerName,
    passengerWeight,
    onRemove,
    onChangeExitWeight,
    onChangePassengerName,
    onChangePassengerWeight,
  } = props;
  const { global: globalState } = useAppSelector((root) => root);

  const { data, loading } = useQueryDropzoneUsersDetails({
    variables: {
      dropzoneUserId,
      dropzoneId,
    },
    onError: console.error,
  });

  React.useEffect(() => {
    if (!exitWeight && data?.user?.exitWeight) {
      onChangeExitWeight(Number(data.user.exitWeight));
    }
  }, [data?.user.exitWeight, exitWeight, onChangeExitWeight]);
  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 16 }} elevation={3}>
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
              {calculateWingLoading(exitWeight, selectedRig.canopySize)}
            </Chip>
          )}
        </ScrollView>
        <View style={styles.row}>
          <View style={styles.rowFirst}>
            <RigSelect
              userId={dropzoneUserId}
              dropzoneId={dropzoneId}
              onSelect={onChangeRig}
              value={selectedRig}
              tandem={isTandem}
              autoSelectFirst
              required
            />
          </View>
          <View style={styles.rowLast}>
            <NumberField
              value={!exitWeight ? 0 : exitWeight}
              onChangeText={(num) => onChangeExitWeight(num)}
              label="Exit weight (kg)"
            />
          </View>
        </View>
        {!isTandem ? null : (
          <>
            <Divider />
            <List.Subheader>Passenger</List.Subheader>
            <View style={styles.row}>
              <View style={styles.rowFirst}>
                <TextInput
                  value={passengerName || ''}
                  onChangeText={(text: string) => onChangePassengerName?.(text)}
                  label="Passenger name"
                  mode="outlined"
                />
              </View>
              <View style={styles.rowLast}>
                <NumberField
                  value={!passengerWeight ? 0 : passengerWeight}
                  onChangeText={(num) => onChangePassengerWeight?.(num)}
                  label="Exit weight (kg)"
                />
              </View>
            </View>
          </>
        )}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="text" onPress={() => onRemove?.()}>
          Remove
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  rowFirst: {
    flex: 2 / 4,
    marginRight: 4,
  },
  rowLast: {
    flex: 2 / 4,
  },
  actions: { justifyContent: 'flex-end' },
});
