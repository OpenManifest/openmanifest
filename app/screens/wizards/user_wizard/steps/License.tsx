import * as React from 'react';
import { HelperText } from 'react-native-paper';
import LicenseCardSelect from 'app/components/input/card_select/LicenseCardSelect';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function FederationStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="License">
      <Fields>
        {(state?.fields?.license?.value?.federation?.id || state?.federation?.value?.id) && (
          <>
            <LicenseCardSelect
              value={state.fields.license.value}
              federationId={Number(
                state?.fields?.license?.value?.federation?.id || state.federation?.value?.id
              )}
              onSelect={(value) => dispatch(actions.forms.user.setField(['license', value]))}
            />
            <HelperText type={state.fields.license.error ? 'error' : 'info'}>
              {state.fields.license.error || ''}
            </HelperText>
          </>
        )}
      </Fields>
    </Step>
  );
}
export default FederationStep;
