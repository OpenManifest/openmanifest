import { useDropzoneUserProfileQuery } from 'app/api/reflection';
import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Card, TextInput, ProgressBar, Divider, List, Button } from 'react-native-paper';
import { Rig } from 'app/api/schema.d';
import { useAppSelector } from 'app/state';
import calculateWingLoading from 'app/utils/calculateWingLoading';
import Chip from 'app/components/chips/Chip';
import UserAvatar from 'app/components/UserAvatar';
import RigSelect from '../../input/dropdown_select/RigSelect';
import NumberField, { NumberFieldType } from '../../input/number_input/NumberField';

interface IUserRigCard {
  dropzoneUserId: string;
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

export default function UserCard(props: IUserRigCard) {
  const {
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

  const { data, loading } = useDropzoneUserProfileQuery({
    variables: {
      id: dropzoneUserId,
    },
    skip: !dropzoneUserId,
    onError: console.error,
  });

  React.useEffect(() => {
    if (!exitWeight && data?.dropzoneUser?.user?.exitWeight) {
      onChangeExitWeight(Number(data.dropzoneUser.user.exitWeight));
    }
  }, [data?.dropzoneUser?.user.exitWeight, exitWeight, onChangeExitWeight]);
  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 16 }} elevation={1}>
      <ProgressBar indeterminate color={globalState.theme.colors.primary} visible={loading} />
      <Card.Title
        title={data?.dropzoneUser?.user.name}
        left={() => (
          <UserAvatar
            name={data?.dropzoneUser?.user?.name}
            image={data?.dropzoneUser?.user?.image}
            size={36}
          />
        )}
      />

      <Card.Content>
        <Divider style={{ marginBottom: 8 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {!selectedRig || !exitWeight || !selectedRig.canopySize ? null : (
            <Chip small icon="escalator-down" mode="outlined" disabled>
              {calculateWingLoading(exitWeight, selectedRig.canopySize)}
            </Chip>
          )}
          <Chip small icon="lock" mode="outlined" disabled>
            {data?.dropzoneUser?.role?.name}
          </Chip>
          <Chip small icon="ticket-account" mode="outlined" disabled>
            {data?.dropzoneUser?.license?.name}
          </Chip>
        </ScrollView>
        <View style={styles.row}>
          <View style={styles.rowFirst}>
            <RigSelect
              small
              dropzoneUserId={dropzoneUserId ? Number(dropzoneUserId) : undefined}
              onSelect={onChangeRig}
              value={selectedRig}
              tandem={isTandem}
              autoSelectFirst
            />
          </View>
          <View style={styles.rowLast}>
            <NumberField
              value={!exitWeight ? 0 : exitWeight}
              onChange={(num) => onChangeExitWeight(num)}
              label="Exit weight (kg)"
              variant={NumberFieldType.Weight}
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
                  onChange={(num) => onChangePassengerWeight?.(num)}
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
