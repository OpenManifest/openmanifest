import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { HelperText } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function UserInfoScreen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Nickname">
      <Fields>
        <TextInput
          value={state.fields?.nickname?.value || ''}
          mode="flat"
          onChangeText={(newValue) => dispatch(actions.forms.user.setField(['nickname', newValue]))}
          label="Nickname"
          style={{ backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
        <HelperText type={state.fields.nickname.error ? 'error' : 'info'}>
          {state.fields.nickname.error || 'This will be displayed as your preferred name'}
        </HelperText>
      </Fields>
    </Step>
  );
}
export default UserInfoScreen;
