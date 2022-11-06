import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { HelperText } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function RealName(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Real name">
      <Fields>
        <TextInput
          value={state.fields?.name?.value || ''}
          mode="flat"
          onChangeText={(newValue) => dispatch(actions.forms.user.setField(['name', newValue]))}
          label="Name"
          style={{ backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
        <HelperText type={state.fields.name.error ? 'error' : 'info'}>
          {state.fields.name.error || ''}
        </HelperText>
      </Fields>
    </Step>
  );
}

export default RealName;
