import * as React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, Surface, TextInput } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import Select from 'app/components/input/select/Select';

function RigWizardScreen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.rig);
  const dispatch = useAppDispatch();
  const [isOtherMake, setIsOtherMake] = React.useState(false);

  return (
    <Step {...props} title="Your rig">
      <Fields>
        <Select<string>
          label="Manufacturer"
          onChange={(value) => {
            setIsOtherMake(value === 'other');
            dispatch(actions.forms.rig.setField(['make', value]));
          }}
          value={state.fields.make.value}
          options={[
            'Icon',
            'Javelin',
            'Mirage',
            'Vector',
            'PA (Talon)',
            'Infinity',
            'Parachutes de France',
            'Parachute Systems',
            'Racer',
          ]
            .map((label) => ({ label, value: label }))
            .concat([{ label: 'Other', value: 'other' }])}
        />
        {!isOtherMake ? null : (
          <Surface style={styles.card}>
            <TextInput
              style={{ backgroundColor: 'transparent' }}
              mode="flat"
              label="Other manufacturer"
              error={!!state.fields.make.error}
              value={state.fields.make.value || ''}
              onChangeText={(newValue) => dispatch(actions.forms.rig.setField(['make', newValue]))}
            />
          </Surface>
        )}
        {state.fields.make.error && (
          <HelperText type={state.fields.make.error ? 'error' : 'info'}>
            {state.fields.make.error || ''}
          </HelperText>
        )}

        <Surface style={styles.card}>
          <TextInput
            style={{ backgroundColor: 'transparent' }}
            mode="flat"
            label="Model"
            error={!!state.fields.model.error}
            value={state.fields.model.value || ''}
            onChangeText={(newValue) => dispatch(actions.forms.rig.setField(['model', newValue]))}
          />
          <HelperText type={state.fields.model.error ? 'error' : 'info'}>
            {state.fields.model.error || 'e.g G4.1'}
          </HelperText>
        </Surface>
        <Surface style={styles.card}>
          <TextInput
            style={{ backgroundColor: 'transparent' }}
            mode="flat"
            label="Serial number"
            error={!!state.fields.serial.error}
            value={state.fields.serial.value || ''}
            onChangeText={(newValue) => dispatch(actions.forms.rig.setField(['serial', newValue]))}
          />
          {state.fields.serial.error && (
            <HelperText type={state.fields.serial.error ? 'error' : 'info'}>
              {state.fields.serial.error}
            </HelperText>
          )}
        </Surface>
      </Fields>
    </Step>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  field: {
    marginBottom: 8,
    backgroundColor: 'transparent',
    marginVertical: 16,
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  card: { marginVertical: 8 },
  title: {
    color: 'white',
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default RigWizardScreen;
