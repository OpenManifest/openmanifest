import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, HelperText, Divider, Chip, List } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../../redux';


import slice from "./slice";
import JumpTypeChipSelect from '../../JumpTypeChipSelect';
import TicketTypeChipSelect from '../../TicketTypeChipSelect';
import useRestriction from '../../../hooks/useRestriction';
import RigSelect from '../../RigSelect';

const { actions } = slice;
export default function SlotForm() {
  const state = useAppSelector(state => state.slotForm);
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.global);

  React.useEffect(() => {
    if (state.fields.user?.value) {
      if (!state.fields.exitWeight.value) {
        dispatch(
          actions.setField(["exitWeight", Number(state.fields.user.value.exitWeight || 60)])
        );
      }

      if (!state.fields.rig.value && state.fields.user.value.rigs?.length) {
        dispatch(
          actions.setField(["rig", state.fields.user.value.rigs[0]])
        );
      }

    }
  }, [state.fields?.user?.value?.id]);

  const isEdit = state?.original?.id;

  const allowedToManifestOthers = useRestriction(
    isEdit ? "updateUserSlot" : "createUserSlot"
  )

  return ( 
    <> 
      <JumpTypeChipSelect
        value={state.fields.jumpType.value}
        required
        userId={Number(state?.fields?.user?.value?.id) || null}
        onSelect={(value) => dispatch(actions.setField(["jumpType", value]))}
      />
      <HelperText type={!!state.fields.jumpType.error ? "error" : "info"}>
        { state.fields.jumpType.error || "" }
      </HelperText>

      <TicketTypeChipSelect
        value={state.fields.ticketType.value}
        required
        onlyPublicTickets={!allowedToManifestOthers}
        onSelect={(value) => dispatch(actions.setField(["ticketType", value]))}
      />
      <HelperText type={!!state.fields.ticketType.error ? "error" : "info"}>
        { state.fields.ticketType.error || "" }
      </HelperText>

      {
        !state?.fields?.ticketType?.value?.extras?.length ? null:  (
          <List.Subheader>
            Ticket addons
          </List.Subheader>
        )
      }
      <ScrollView horizontal style={styles.ticketAddons}>
        {state?.fields?.ticketType?.value?.extras?.map((extra) =>
          <Chip
            selected={state?.fields?.extras.value?.some(({id}) => id === extra.id)}
            onPress={
              state?.fields?.extras.value?.some(({id}) => id === extra.id)
              ? () => dispatch(actions.setField(["extras", state?.fields?.extras.value?.filter(({ id }) => id !== extra.id)]))
              : () => dispatch(actions.setField(["extras", [...(state?.fields?.extras?.value || []), extra]]))
            }
          >
            {`${extra.name} ($${extra.cost})`}
          </Chip>
        )}
      </ScrollView>
      <HelperText type={!!state.fields.extras.error ? "error" : "info"}>
        { state.fields.extras.error || "" }
      </HelperText>
      <Divider />
      { !state.fields.user ? null : <RigSelect
        value={state.fields.rig.value}
        userId={Number(state.fields.user?.value?.id)}
        dropzoneId={Number(globalState.currentDropzone?.id)}
        onSelect={(value) => dispatch(actions.setField(["jumpType", value]))}
      />}
      <HelperText type={!!state.fields.rig.error ? "error" : "info"}>
        { state.fields.rig.error || "" }
      </HelperText>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Exit weight"
        error={!!state.fields.exitWeight.error}
        value={state.fields.exitWeight?.value?.toString() || ""}
        keyboardType="numbers-and-punctuation"
        right={() => <TextInput.Affix text="kg" />}
        onChangeText={(newValue) => dispatch(actions.setField(["exitWeight", Number(newValue)]))}
      />
      
      <HelperText type={!!state.fields.exitWeight.error ? "error" : "info"}>
        { state.fields.exitWeight.error || "" }
      </HelperText>

      {
        !state.fields.ticketType.value?.isTandem ? null : (
          <>
            <List.Subheader>Passenger</List.Subheader>
            <TextInput
              style={styles.field}
              mode="outlined"
              label="Passenger name"
              error={!!state.fields.passengerName.error}
              value={state.fields.passengerName?.value?.toString() || ""}
              onChangeText={(newValue) => dispatch(actions.setField(["passengerName", newValue]))}
            />
            
            <TextInput
              style={styles.field}
              mode="outlined"
              label="Passenger exit weight"
              error={!!state.fields.passengerExitWeight.error}
              value={state.fields.passengerExitWeight.value?.toString() || ""}
              onChangeText={(newValue) => dispatch(actions.setField(["passengerExitWeight", Number(newValue)]))}
            />
          </>
        )
      }
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
    marginBottom: 8
  }
});
