import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { HelperText } from 'react-native-paper';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function FederationWizardSceen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title={`${state.federation?.value?.name?.toUpperCase()} Number`}>
      <Fields>
        <TextInput
          value={state.fields?.apfNumber?.value || ''}
          mode="flat"
          style={{ backgroundColor: 'transparent', fontSize: 32, height: 70 }}
          onChangeText={(newValue) =>
            dispatch(actions.forms.user.setField(['apfNumber', newValue]))
          }
          label={`${state.federation.value?.name} ID`}
        />
        <HelperText type={state.federation.error ? 'error' : 'info'}>
          {state.federation.error || ''}
        </HelperText>
      </Fields>
    </Step>
  );
}

export default FederationWizardSceen;
