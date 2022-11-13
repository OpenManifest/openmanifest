import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Card, ProgressBar, Divider, List, Button } from 'react-native-paper';
import { useAppSelector } from 'app/state';
import calculateWingLoading from 'app/utils/calculateWingLoading';
import Chip from 'app/components/chips/Chip';
import TextInput from 'app/components/input/text/TextField';
import UserAvatar from 'app/components/UserAvatar';
import { RigEssentialsFragment } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
import RigSelect from '../../input/dropdown_select/RigSelect';
import NumberField, { NumberFieldType } from '../../input/number_input/NumberField';

interface IUserRigCard {
  dropzoneUserId: string;
  exitWeight?: number;
  isTandem?: boolean;
  selectedRig?: RigEssentialsFragment;

  passengerName?: string | null;
  passengerWeight?: number | null;
  onRemove?(): void;
  onChangeExitWeight(weight: number): void;
  onChangeRig(rig: RigEssentialsFragment): void;
  onChangePassengerName?(name: string): void;
  onChangePassengerWeight?(weight: number): void;
}

export default function UserRigCard(props: IUserRigCard) {
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

  const { dropzoneUser, loading } = useUserProfile({
    id: dropzoneUserId,
  });

  React.useEffect(() => {
    if (!exitWeight && dropzoneUser?.user?.exitWeight) {
      onChangeExitWeight(Number(dropzoneUser.user.exitWeight));
    }
  }, [dropzoneUser?.user.exitWeight, exitWeight, onChangeExitWeight]);
  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 16 }} elevation={1}>
      <ProgressBar indeterminate color={globalState.theme.colors.primary} visible={loading} />
      <Card.Title
        title={dropzoneUser?.user.name}
        left={() => (
          <UserAvatar name={dropzoneUser?.user?.name} image={dropzoneUser?.user?.image} size={36} />
        )}
        titleStyle={{ paddingRight: 0 }}
        right={() => (
          <View style={{ maxWidth: 100, marginRight: 16 }}>
            <NumberField
              value={!exitWeight ? 0 : exitWeight}
              mode="flat"
              variant={NumberFieldType.Weight}
              onChange={(num) => onChangeExitWeight(num)}
            />
          </View>
        )}
      />

      <Card.Content>
        <Divider style={{ marginBottom: 8 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <RigSelect
            small
            variant="chip"
            dropzoneUserId={dropzoneUserId ? Number(dropzoneUserId) : undefined}
            onChange={onChangeRig}
            value={selectedRig}
            tandem={isTandem}
            autoSelectFirst
          />
          {!selectedRig || !exitWeight || !selectedRig.canopySize ? null : (
            <Chip small icon="escalator-down" mode="outlined" disabled>
              {calculateWingLoading(exitWeight, selectedRig.canopySize)}
            </Chip>
          )}
          <Chip small icon="lock" mode="outlined" disabled>
            {dropzoneUser?.role?.name}
          </Chip>
          <Chip small icon="ticket-account" mode="outlined" disabled>
            {dropzoneUser?.license?.name}
          </Chip>
        </ScrollView>
        {!isTandem ? null : (
          <>
            <Divider />
            <List.Subheader>Passenger</List.Subheader>
            <View style={styles.row}>
              <View style={styles.rowFirst}>
                <TextInput
                  mode="flat"
                  value={passengerName || ''}
                  onChangeText={(text: string) => onChangePassengerName?.(text)}
                  label="Passenger name"
                />
              </View>
              <View style={styles.rowLast}>
                <NumberField
                  value={!passengerWeight ? 0 : passengerWeight}
                  onChange={(num) => onChangePassengerWeight?.(num)}
                  variant={NumberFieldType.Weight}
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
