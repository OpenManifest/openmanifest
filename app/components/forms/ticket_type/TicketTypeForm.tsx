import { useTicketTypeExtrasQuery } from 'app/api/reflection';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { HelperText, Checkbox, List, Divider } from 'react-native-paper';
import { useDropzoneContext } from 'app/providers';
import { actions, useAppSelector, useAppDispatch } from 'app/state';
import { TicketTypeExtraEssentialsFragment } from 'app/api/operations';
import Select from 'app/components/input/select/Select';

interface IAltitudeSelectProps {
  value: number;
  onChange(value: number): void;
}

function AltitudeSelect(props: IAltitudeSelectProps) {
  const { value, onChange } = props;

  return (
    <Select
      {...{ value, onChange }}
      options={[
        { label: 'Hop n Pop', value: 4000, icon: 'parachute' },
        { label: 'Height', value: 14000, icon: 'airplane-takeoff' },
        { label: 'Other', value: -1, icon: 'parachute' },
      ]}
    />
  );
}
export default function TicketTypeForm() {
  const state = useAppSelector((root) => root.forms.ticketType);
  const dispatch = useAppDispatch();
  const { dropzone: currentDropzone } = useDropzoneContext();

  const { data } = useTicketTypeExtrasQuery({
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
    },
  });

  return (
    <>
      <TextInput
        style={styles.field}
        label="Name"
        error={state.fields.name.error}
        value={state.fields.name.value || ''}
        helperText="Name of the ticket users will see"
        onChange={(newValue) => dispatch(actions.forms.ticketType.setField(['name', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Price"
        error={state.fields.cost.error}
        value={state.fields.cost?.value?.toString()}
        onChange={(newValue) =>
          dispatch(actions.forms.ticketType.setField(['cost', Number(newValue)]))
        }
      />
      <HelperText type={state.fields.cost.error ? 'error' : 'info'}>
        {state.fields.cost.error || 'Base cost without extra ticket addons'}
      </HelperText>
      <View style={{ width: '100%' }}>
        <AltitudeSelect
          value={state.fields.altitude.value ?? 14000}
          onChange={(newValue) =>
            dispatch(actions.forms.ticketType.setField(['altitude', newValue]))
          }
        />

        {(!state.fields.altitude.value || ![4000, 14000].includes(state.fields.altitude.value)) && (
          <TextInput
            style={styles.field}
            label="Custom altitude"
            error={state.fields.altitude.error}
            value={state.fields.altitude?.value?.toString()}
            onChange={(newValue) =>
              dispatch(actions.forms.ticketType.setField(['altitude', Number(newValue)]))
            }
          />
        )}

        <Checkbox.Item
          label="Tandem"
          style={{ width: '100%' }}
          status={state.fields.isTandem.value ? 'checked' : 'unchecked'}
          onPress={() =>
            dispatch(actions.forms.ticketType.setField(['isTandem', !state.fields.isTandem.value]))
          }
        />
        <HelperText type={state.fields.isTandem.error ? 'error' : 'info'}>
          {state.fields.isTandem.error ||
            'Allow also manifesting a passenger when using this ticket type'}
        </HelperText>

        <Checkbox.Item
          label="Public manifesting"
          style={{ width: '100%' }}
          status={state.fields.allowManifestingSelf.value ? 'checked' : 'unchecked'}
          onPress={() =>
            dispatch(
              actions.forms.ticketType.setField([
                'allowManifestingSelf',
                !state.fields.allowManifestingSelf.value,
              ])
            )
          }
        />

        <HelperText type={state.fields.allowManifestingSelf.error ? 'error' : 'info'}>
          {state.fields.allowManifestingSelf.error ||
            'Allow users to manifest themselves with this ticket'}
        </HelperText>

        <Divider />
        <List.Subheader>Enabled ticket add-ons</List.Subheader>
        {data?.extras.map((extra) => (
          <Checkbox.Item
            key={`extra-${extra.id}`}
            label={extra.name || ''}
            status={
              state.fields.extras.value?.map(({ id }) => id).includes(extra.id)
                ? 'checked'
                : 'unchecked'
            }
            onPress={() =>
              dispatch(
                actions.forms.ticketType.setField([
                  'extras',
                  state.fields.extras.value?.map(({ id }) => id).includes(extra.id)
                    ? state.fields.extras.value?.filter(({ id }) => id !== extra.id)
                    : [
                        ...(state.fields.extras?.value as Required<
                          TicketTypeExtraEssentialsFragment[]
                        >),
                        extra,
                      ],
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
  field: {
    marginBottom: 8,
    width: '100%',
  },
});
