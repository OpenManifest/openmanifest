import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Checkbox, List } from 'react-native-paper';
import { useTicketTypesQuery } from 'app/api/reflection';
import { actions, useAppSelector, useAppDispatch } from '../../../state';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';

export default function ExtraForm() {
  const state = useAppSelector((root) => root.forms.extra);
  const dispatch = useAppDispatch();
  const currentDropzone = useCurrentDropzone();
  const { data } = useTicketTypesQuery({
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    },
  });

  return (
    <>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        value={state.fields.name.value || ''}
        onChangeText={(newValue) => dispatch(actions.forms.extra.setField(['name', newValue]))}
      />
      <HelperText type={state.fields.name.error ? 'error' : 'info'}>
        {state.fields.name.error || ''}
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Price"
        error={!!state.fields.cost.error}
        value={state.fields.cost?.value?.toString()}
        onChangeText={(newValue) =>
          dispatch(actions.forms.extra.setField(['cost', Number(newValue)]))
        }
      />
      <HelperText type={state.fields.cost.error ? 'error' : 'info'}>
        {state.fields.cost.error || ''}
      </HelperText>

      <View style={{ width: '100%' }}>
        <List.Subheader>Compatible tickets</List.Subheader>
        {data?.ticketTypes.map((ticket) => (
          <Checkbox.Item
            label={ticket.name || ''}
            status={
              state.fields.ticketTypes.value?.map(({ id }) => id).includes(ticket.id)
                ? 'checked'
                : 'unchecked'
            }
            onPress={() =>
              dispatch(
                actions.forms.extra.setField([
                  'ticketTypes',
                  state.fields.ticketTypes.value?.map(({ id }) => id).includes(ticket.id)
                    ? state.fields.ticketTypes.value?.filter(({ id }) => id !== ticket.id)
                    : [...(state.fields.ticketTypes.value || []), ticket],
                ])
              )
            }
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    width: '100%',
    flex: 1,
  },
  field: {
    marginBottom: 8,
    width: '100%',
  },
});
