import { useTicketTypeExtrasQuery } from 'app/api/reflection';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Checkbox, Menu, List, Divider } from 'react-native-paper';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { actions, useAppSelector, useAppDispatch } from 'app/state';
import { TicketTypeExtraEssentialsFragment } from 'app/api/operations';

const ALTITUDE_LABEL_MAP: { [key: string]: string } = {
  '14000': 'Height',
  '4000': 'Hop n Pop',
};

export default function TicketTypeForm() {
  const state = useAppSelector((root) => root.forms.ticketType);
  const dispatch = useAppDispatch();
  const currentDropzone = useCurrentDropzone();

  const [altitudeMenuOpen, setAltitudeMenuOpen] = React.useState(false);
  const { data } = useTicketTypeExtrasQuery({
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
        onChangeText={(newValue) => dispatch(actions.forms.ticketType.setField(['name', newValue]))}
      />
      <HelperText type={state.fields.name.error ? 'error' : 'info'}>
        {state.fields.name.error || 'Name of the ticket users will see'}
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Price"
        error={!!state.fields.cost.error}
        value={state.fields.cost?.value?.toString()}
        onChangeText={(newValue) =>
          dispatch(actions.forms.ticketType.setField(['cost', Number(newValue)]))
        }
      />
      <HelperText type={state.fields.cost.error ? 'error' : 'info'}>
        {state.fields.cost.error || 'Base cost without extra ticket addons'}
      </HelperText>
      <View style={{ width: '100%' }}>
        <Menu
          onDismiss={() => setAltitudeMenuOpen(false)}
          visible={altitudeMenuOpen}
          style={{ position: 'absolute', right: '10%', left: '10%', flex: 1 }}
          anchor={
            <List.Item
              onPress={() => {
                setAltitudeMenuOpen(true);
              }}
              title={
                state.fields.altitude.value &&
                state.fields.altitude.value.toString() in ALTITUDE_LABEL_MAP
                  ? ALTITUDE_LABEL_MAP[state.fields.altitude.value.toString()]
                  : 'Custom'
              }
              style={{ width: '100%', flex: 1 }}
              right={() => (
                <List.Icon
                  icon={
                    state.fields.altitude.value &&
                    state.fields.altitude.value.toString() in ALTITUDE_LABEL_MAP
                      ? ALTITUDE_LABEL_MAP[state.fields.altitude.value.toString()]
                      : 'pencil-plus'
                  }
                />
              )}
            />
          }
        >
          <List.Item
            onPress={() => {
              dispatch(actions.forms.ticketType.setField(['altitude', 4000]));
              setAltitudeMenuOpen(false);
            }}
            title="Hop n Pop"
            right={() => <List.Icon icon="parachute" />}
          />
          <List.Item
            onPress={() => {
              dispatch(actions.forms.ticketType.setField(['altitude', 14000]));
              setAltitudeMenuOpen(false);
            }}
            title="Height"
            right={() => <List.Icon icon="airplane-takeoff" />}
          />
          <List.Item
            onPress={() => {
              dispatch(actions.forms.ticketType.setField(['altitude', 7000]));
              setAltitudeMenuOpen(false);
            }}
            title="Other"
            right={() => <List.Icon icon="parachute" />}
          />
        </Menu>

        {(!state.fields.altitude.value || ![4000, 14000].includes(state.fields.altitude.value)) && (
          <TextInput
            style={styles.field}
            mode="outlined"
            label="Custom altitude"
            error={!!state.fields.altitude.error}
            value={state.fields.altitude?.value?.toString()}
            onChangeText={(newValue) =>
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
