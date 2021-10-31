import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card, HelperText, TextInput } from 'react-native-paper';
import FederationCardSelect from 'app/components/input/card_select/FederationCardSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function FederationWizardSceen(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Affiliation">
      <Fields>
        <FederationCardSelect
          value={state?.fields?.license?.value?.federation || state.federation.value}
          onSelect={(value) => dispatch(actions.forms.user.setFederation(value))}
        />
        <HelperText type={state.federation.error ? 'error' : 'info'}>
          {state.federation.error || ''}
        </HelperText>
      </Fields>
    </Step>
  );
}

export default FederationWizardSceen;
