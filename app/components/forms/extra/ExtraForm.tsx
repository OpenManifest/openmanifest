import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { Checkbox, List } from 'react-native-paper';
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
        label="Name"
        error={state.fields.name.error}
        value={state.fields.name.value || ''}
        onChange={(newValue) => dispatch(actions.forms.extra.setField(['name', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Price"
        error={state.fields.cost.error}
        value={state.fields.cost?.value?.toString()}
        onChange={(newValue) => dispatch(actions.forms.extra.setField(['cost', Number(newValue)]))}
      />

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
