import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { HelperText, Divider, Chip, List } from 'react-native-paper';
import NumberField, { NumberFieldType } from 'app/components/input/number_input/NumberField';
import { actions, useAppSelector, useAppDispatch } from '../../../state';

import { Permission } from '../../../api/schema.d';
import JumpTypeChipSelect from '../../input/chip_select/JumpTypeChipSelect';
import TicketTypeChipSelect from '../../input/chip_select/TicketTypeChipSelect';
import useRestriction from '../../../hooks/useRestriction';
import RigSelect from '../../input/dropdown_select/RigSelect';

export default function ManifestForm() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifest);
  React.useEffect(() => {
    if (state.fields.dropzoneUser?.value) {
      if (!state.fields.exitWeight.value) {
        dispatch(
          actions.forms.manifest.setField([
            'exitWeight',
            Number(state.fields.dropzoneUser?.value?.user?.exitWeight || 60),
          ])
        );
      }

      if (!state.fields.rig.value && state.fields.dropzoneUser.value?.user?.rigs?.length) {
        dispatch(
          actions.forms.manifest.setField(['rig', state.fields.dropzoneUser?.value?.user.rigs[0]])
        );
      }
    }
  }, [
    dispatch,
    state.fields.dropzoneUser.value,
    state.fields.dropzoneUser.value?.id,
    state.fields.exitWeight.value,
    state.fields.rig.value,
  ]);

  const isEdit = state?.original?.id;

  const allowedToManifestOthers = useRestriction(
    isEdit ? Permission.UpdateUserSlot : Permission.CreateUserSlot
  );

  return (
    <>
      <JumpTypeChipSelect
        value={state.fields.jumpType.value}
        userId={Number(state?.fields?.dropzoneUser?.value?.id) || null}
        onSelect={(value) => dispatch(actions.forms.manifest.setField(['jumpType', value]))}
      />
      <HelperText type={state.fields.jumpType.error ? 'error' : 'info'}>
        {state.fields.jumpType.error || ''}
      </HelperText>

      <TicketTypeChipSelect
        value={state.fields.ticketType.value}
        onlyPublicTickets={!allowedToManifestOthers}
        onSelect={(value) => dispatch(actions.forms.manifest.setField(['ticketType', value]))}
      />
      <HelperText type={state.fields.ticketType.error ? 'error' : 'info'}>
        {state.fields.ticketType.error || ''}
      </HelperText>

      {!state?.fields?.ticketType?.value?.extras?.length ? null : (
        <List.Subheader>Ticket addons</List.Subheader>
      )}
      <ScrollView horizontal style={styles.ticketAddons}>
        {state?.fields?.ticketType?.value?.extras?.map((extra) => (
          <Chip
            selected={state?.fields?.extras.value?.some(({ id }) => id === extra.id)}
            onPress={
              state?.fields?.extras.value?.some(({ id }) => id === extra.id)
                ? () =>
                    dispatch(
                      actions.forms.manifest.setField([
                        'extras',
                        state?.fields?.extras.value?.filter(({ id }) => id !== extra.id),
                      ])
                    )
                : () =>
                    dispatch(
                      actions.forms.manifest.setField([
                        'extras',
                        [...(state?.fields?.extras?.value || []), extra],
                      ])
                    )
            }
          >
            {`${extra.name} ($${extra.cost})`}
          </Chip>
        ))}
      </ScrollView>
      <HelperText type={state.fields.extras.error ? 'error' : 'info'}>
        {state.fields.extras.error || ''}
      </HelperText>
      <Divider />
      {!state.fields.dropzoneUser ? null : (
        <RigSelect
          label="Equipment"
          value={state.fields.rig.value}
          dropzoneUserId={Number(state.fields.dropzoneUser?.value?.id)}
          onSelect={(value) => dispatch(actions.forms.manifest.setField(['rig', value]))}
        />
      )}
      <HelperText type={state.fields.rig.error ? 'error' : 'info'}>
        {state.fields.rig.error || ''}
      </HelperText>
      <NumberField
        label="Exit weight"
        variant={NumberFieldType.Weight}
        error={state.fields.exitWeight.error}
        value={state.fields.exitWeight?.value}
        onChange={(newValue) =>
          dispatch(actions.forms.manifest.setField(['exitWeight', Number(newValue)]))
        }
      />

      {!state.fields.ticketType.value?.isTandem ? null : (
        <>
          <List.Subheader>Passenger</List.Subheader>
          <TextInput
            style={styles.field}
            label="Passenger name"
            error={state.fields.passengerName.error}
            value={state.fields.passengerName?.value?.toString() || ''}
            onChange={(newValue) =>
              dispatch(actions.forms.manifest.setField(['passengerName', newValue]))
            }
          />

          <TextInput
            style={styles.field}
            label="Passenger exit weight"
            error={state.fields.passengerExitWeight.error}
            value={state.fields.passengerExitWeight.value?.toString() || ''}
            onChange={(newValue) =>
              dispatch(actions.forms.manifest.setField(['passengerExitWeight', Number(newValue)]))
            }
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  },
  ticketAddons: {
    marginBottom: 8,
  },
});
