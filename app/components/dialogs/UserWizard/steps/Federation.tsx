import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, HelperText } from 'react-native-paper';
import LicenseChipSelect from '../../../input/chip_select/LicenseChipSelect';
import FederationSelect from '../../../input/dropdown_select/FederationSelect';
import WizardScreen, { IWizardScreenProps } from '../../../wizard/WizardScreen';
import { actions, useAppDispatch, useAppSelector } from '../../../../state';

function FederationWizardSceen(props: IWizardScreenProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container} {...props} title="What license do you have?">
      <View style={styles.content}>
        <Card style={styles.card}>
          <FederationSelect
            value={state?.fields?.license?.value?.federation || state.federation.value}
            onSelect={(value) => dispatch(actions.forms.user.setFederation(value))}
            required
          />
          <HelperText type={state.federation.error ? 'error' : 'info'}>
            {state.federation.error || ''}
          </HelperText>
        </Card>

        <Card style={{ padding: 16 }}>
          {(state?.fields?.license?.value?.federation?.id || state?.federation?.value?.id) && (
            <>
              <LicenseChipSelect
                value={state.fields.license.value}
                federationId={Number(
                  state?.fields?.license?.value?.federation?.id || state.federation?.value?.id
                )}
                onSelect={(value) => dispatch(actions.forms.user.setField(['license', value]))}
                required
              />
              <HelperText type={state.fields.license.error ? 'error' : 'info'}>
                {state.fields.license.error || ''}
              </HelperText>
            </>
          )}
        </Card>
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
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

export default FederationWizardSceen;
