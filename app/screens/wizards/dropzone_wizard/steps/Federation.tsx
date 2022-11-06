import * as React from 'react';
import { HelperText } from 'react-native-paper';
import FederationCardSelect from 'app/components/input/card_select/FederationCardSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
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
export default Federation;
