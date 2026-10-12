import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Card, Divider, List, Button } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { useAppTheme } from 'app/theme';
import calculateWingLoading from 'app/utils/calculateWingLoading';
import Chip from 'app/components/chips/Chip';
import TextInput from 'app/components/input/text/TextField';
import UserAvatar from 'app/components/UserAvatar';
import { RigEssentialsFragment } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
import RigSelect from 'app/components/input/dropdown_select/RigSelect';
import NumberField, { NumberFieldType } from 'app/components/input/number_input/NumberField';

interface IUserRigCard {
  membershipId: string;
  bodyMassKg?: number;
  isTandem?: boolean;
  selectedRig?: RigEssentialsFragment;

  guestName?: string | null;
  guestWeight?: number | null;
  onRemove?(): void;
  onChangeBodyMassKg(weight: number): void;
  onChangeRig(rig: RigEssentialsFragment): void;
  onChangeGuestName?(name: string): void;
  onChangeGuestWeight?(weight: number): void;
}

export default function UserRigCard(props: IUserRigCard) {
  const {
    membershipId,
    onChangeRig,
    bodyMassKg,
    selectedRig,
    isTandem,
    guestName,
    guestWeight,
    onRemove,
    onChangeBodyMassKg,
    onChangeGuestName,
    onChangeGuestWeight,
  } = props;
  const { theme } = useAppTheme();

  const { membership, loading } = useUserProfile({
    id: membershipId,
  });

  React.useEffect(() => {
    if (!bodyMassKg && membership?.user?.bodyMassKg) {
      onChangeBodyMassKg(Number(membership.user.bodyMassKg));
    }
  }, [membership?.user.bodyMassKg, bodyMassKg, onChangeBodyMassKg]);
  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 16 }} elevation={1}>
      <ProgressBar indeterminate color={theme.colors.primary} visible={loading} />
      <Card.Title
        title={membership?.user.name}
        left={() => (
          <UserAvatar name={membership?.user?.name} image={membership?.user?.image} size={36} />
        )}
        titleStyle={{ paddingRight: 0 }}
        right={() => (
          <View style={{ maxWidth: 100, marginRight: 16 }}>
            <NumberField
              value={!bodyMassKg ? 0 : bodyMassKg}
              mode="flat"
              variant={NumberFieldType.Weight}
              onChange={(num) => onChangeBodyMassKg(num)}
            />
          </View>
        )}
      />

      <Card.Content>
        <Divider style={{ marginBottom: 8 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ maxWidth: 128 }}>
            <RigSelect
              small
              variant="chip"
              membershipId={membershipId ? Number(membershipId) : undefined}
              onChange={onChangeRig}
              value={selectedRig}
              tandem={isTandem}
              autoSelectFirst
            />
          </View>
          {!selectedRig || !bodyMassKg || !selectedRig.canopySize ? null : (
            <Chip small icon="escalator-down" mode="outlined" disabled>
              {calculateWingLoading(bodyMassKg, selectedRig.canopySize)}
            </Chip>
          )}
          <Chip small icon="lock" mode="outlined" disabled>
            {membership?.role?.name}
          </Chip>
          <Chip small icon="ticket-account" mode="outlined" disabled>
            {membership?.license?.name}
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
                  value={guestName || ''}
                  onChangeText={(text: string) => onChangeGuestName?.(text)}
                  label="Passenger name"
                />
              </View>
              <View style={styles.rowLast}>
                <NumberField
                  value={!guestWeight ? 0 : guestWeight}
                  onChange={(num) => onChangeGuestWeight?.(num)}
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
