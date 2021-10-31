import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Step, Fields, IWizardStepProps } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import CardSelect from 'app/components/input/card_select/CardSelect';

function AskForRigStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.userWizard);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Got a rig?">
      <Fields>
        <CardSelect
          items={[
            { value: false, label: 'I have my own rig' },
            { value: true, label: 'I dont have my own rig' },
          ]}
          renderItemLabel={({ label }) => label}
          onChangeSelected={(options) =>
            dispatch(actions.forms.userWizard.setField(['skipRigSetup', options[0].value]))
          }
          isSelected={({ value }) => value === state.fields.skipRigSetup.value}
          selected={[
            state.fields.skipRigSetup
              ? { value: true, label: 'I dont have my own rig' }
              : { value: false, label: 'I have my own rig' },
          ]}
        />
      </Fields>
    </Step>
  );
}

export default AskForRigStep;
