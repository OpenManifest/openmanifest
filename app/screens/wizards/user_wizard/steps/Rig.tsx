import * as React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { HelperText, Menu, Surface, TextInput } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function RigWizardScreen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.rig);
  const dispatch = useAppDispatch();
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [isOtherMake, setIsOtherMake] = React.useState(false);

  return (
    <Step {...props} title="Your rig">
      <Fields>
        <Menu
          onDismiss={() => setMenuOpen(false)}
          visible={isMenuOpen}
          anchor={
            <TouchableOpacity onPress={() => setMenuOpen(true)}>
              <Surface style={styles.card}>
                <TextInput
                  pointerEvents="box-only"
                  style={{ backgroundColor: 'transparent' }}
                  mode="flat"
                  error={!!state.fields.make.error}
                  value={isOtherMake ? 'Other' : state.fields.make.value || 'Select manufacturer'}
                  disabled
                />
              </Surface>
            </TouchableOpacity>
          }
        >
          {[
            'Icon',
            'Javelin',
            'Mirage',
            'Vector',
            'PA (Talon)',
            'Infinity',
            'Parachutes de France',
            'Parachute Systems',
            'Racer',
          ].map((make) => (
            <Menu.Item
              onPress={() => {
                setMenuOpen(false);
                setIsOtherMake(false);
                dispatch(actions.forms.rig.setField(['make', make]));
              }}
              title={make}
            />
          ))}
          <Menu.Item
            onPress={() => {
              setMenuOpen(false);
              dispatch(actions.forms.rig.setField(['make', '']));
              setIsOtherMake(true);
            }}
            title="Other"
          />
        </Menu>
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
