import * as React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText } from 'react-native-paper';
import FederationCardSelect from 'app/components/input/card_select/FederationCardSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function Federation(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Affiliation">
      <Fields>
        <FederationCardSelect
          value={state.fields.federation.value}
          onSelect={(value) => dispatch(actions.forms.dropzone.setField(['federation', value]))}
        />
        <HelperText type={state.fields.federation.error ? 'error' : 'info'}>
          {state.fields.federation.error || ''}
        </HelperText>
      </Fields>
    </Step>
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

export default Federation;
