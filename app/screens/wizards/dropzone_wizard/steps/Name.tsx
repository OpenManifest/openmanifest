import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { Step, Fields, IWizardStepProps } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function Name(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Name">
      <Fields>
        <TextInput
          mode="flat"
          label="Name"
          error={state.fields.name.error}
          value={state.fields.name.value || ''}
          onChange={(newValue) => dispatch(actions.forms.dropzone.setField(['name', newValue]))}
        />
      </Fields>
    </Step>
  );
}
export default Name;
