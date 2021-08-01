import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, HelperText, List, TextInput } from 'react-native-paper';
import FederationSelect from '../../../../components/input/dropdown_select/FederationSelect';
import WizardScreen, { IWizardScreenProps } from '../../../../components/wizard/WizardScreen';
import { actions, useAppDispatch, useAppSelector } from '../../../../state';

function NameAndFederationWizardSceen(props: IWizardScreenProps) {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container} {...props} title="Basic information">
      <View style={styles.content}>
        <Card style={styles.card}>
          <List.Subheader>Name</List.Subheader>
          <TextInput
            mode="outlined"
            error={!!state.fields.name.error}
            value={state.fields.name.value || ''}
            onChangeText={(newValue) =>
              dispatch(actions.forms.dropzone.setField(['name', newValue]))
            }
          />
          <HelperText type="error">{state.fields.name.error || ''}</HelperText>
        </Card>
        <Card style={styles.card}>
          <FederationSelect
            value={state.fields.federation.value}
            onSelect={(value) => dispatch(actions.forms.dropzone.setField(['federation', value]))}
          />
          <HelperText type={state.fields.federation.error ? 'error' : 'info'}>
            {state.fields.federation.error || ''}
          </HelperText>
        </Card>
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  title: {
    color: 'white',
    marginBottom: 100,
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    marginVertical: 16,
    width: '100%',
  },
});

export default NameAndFederationWizardSceen;
