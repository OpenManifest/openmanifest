import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Card, Divider, List, Button } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { useAppTheme } from 'app/theme';
import { RIG_KIND, wingLoadingOf } from 'app/features/skydiving/rig';
import Chip from 'app/components/chips/Chip';
import TextInput from 'app/components/input/text/TextField';
import UserAvatar from 'app/components/UserAvatar';
import { EquipmentEssentialsFragment } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
import EquipmentPicker from 'app/components/input/dropdown_select/EquipmentPicker';
import NumberField, { NumberFieldType } from 'app/components/input/number_input/NumberField';
import GuestsInput from 'app/forms/manifest_user/GuestsInput';
import useManifestValidator from 'app/hooks/useManifestValidator';
import EligibilityMessages from 'app/components/EligibilityMessages';
import { GuestValue, guestInputsOf } from 'app/forms/manifest_user/guests';

interface IUserEquipmentCard {
  membershipId: string;
  loadId?: string | null;
  groupNumber?: number | null;
  bodyMassKg?: number;
  /** The most guests that ride with the member, as the ticket type allows; 0: the ticket takes none */
  escortCapacity?: number;
  selectedEquipment?: EquipmentEssentialsFragment[];
  ticketTypeId?: string | null;
  activityTypeId?: string | null;

  guests?: GuestValue[];
  onRemove?(): void;
  onChangeBodyMassKg(weight: number): void;
  onChangeEquipment(equipment: EquipmentEssentialsFragment[]): void;
  onChangeGuests?(guests: GuestValue[]): void;
}

export default function UserEquipmentCard(props: IUserEquipmentCard) {
  const {
    membershipId,
    loadId,
    groupNumber,
    onChangeEquipment,
    bodyMassKg,
    selectedEquipment,
    ticketTypeId,
    activityTypeId,
    escortCapacity = 0,
    guests,
    onRemove,
    onChangeBodyMassKg,
    onChangeGuests,
  } = props;
  const { theme } = useAppTheme();
  const validation = useManifestValidator({
    loadId,
    membershipId,
    ticketTypeId,
    activityTypeId,
    equipmentIds: selectedEquipment?.map((item) => item.id),
    groupNumber,
    bodyMassKg,
    guests: escortCapacity > 0 ? guestInputsOf(guests) : undefined,
  });
  // Skydiving: the wing loading under the rig
  const wingLoading = wingLoadingOf(
    selectedEquipment?.find((item) => item.equipmentKind?.key === RIG_KIND),
    bodyMassKg
  );

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
            <EquipmentPicker
              small
              variant="chip"
              membershipId={membershipId ? Number(membershipId) : undefined}
              onChange={onChangeEquipment}
              value={selectedEquipment}
              ticketTypeId={ticketTypeId}
              activityTypeId={activityTypeId}
              tandem={escortCapacity > 0}
              autoSelectFirst
            />
          </View>
          {!wingLoading ? null : (
            <Chip small icon="escalator-down" mode="outlined" disabled>
              {wingLoading}
            </Chip>
          )}
          <Chip small icon="lock" mode="outlined" disabled>
            {membership?.role?.name}
          </Chip>
          <Chip small icon="ticket-account" mode="outlined" disabled>
            {membership?.certificationLevel?.name}
          </Chip>
        </ScrollView>
        {escortCapacity < 1 ? null : (
          <>
            <Divider />
            <GuestsInput
              value={guests}
              capacity={escortCapacity}
              onChange={(next) => onChangeGuests?.(next)}
            />
          </>
        )}
        <EligibilityMessages failures={validation.failures} expiring={validation.expiring} />
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
