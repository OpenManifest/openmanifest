import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Step, Fields, IWizardStepProps } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import CardSelect from 'app/components/input/card_select/CardSelect';

function AskForRigStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.screens.userWizard);
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
            dispatch(actions.screens.userWizard.skipRigSetup(options[0].value))
          }
          isSelected={({ value }) => value === state.skipRigSetup}
          selected={[
            state.skipRigSetup
              ? { value: true, label: 'I dont have my own rig' }
              : { value: false, label: 'I have my own rig' },
          ]}
        />
      </Fields>
    </Step>
  );
}

export default AskForRigStep;
