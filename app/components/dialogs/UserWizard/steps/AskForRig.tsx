import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from 'react-native-paper';
import WizardScreen, { IWizardScreenProps } from '../../../wizard/WizardScreen';
import { actions, useAppDispatch, useAppSelector } from '../../../../state';

function FederationWizardSceen(props: IWizardScreenProps) {
  const state = useAppSelector((root) => root.forms.userWizard);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container} {...props} title="Do you have a rig?">
      <View style={styles.content}>
        <Card
          style={[
            styles.card,
            state.fields.skipRigSetup.value === false ? styles.active : undefined,
          ]}
          onPress={() => dispatch(actions.forms.userWizard.setField(['skipRigSetup', false]))}
        >
          <Card.Title title="I have my own rig" />
        </Card>

        <Card
          style={[
            styles.card,
            state.fields.skipRigSetup.value === true ? styles.active : undefined,
          ]}
          onPress={() => dispatch(actions.forms.userWizard.setField(['skipRigSetup', true]))}
        >
          <Card.Title title="I dont have a rig" />
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
    flex: 1,
    opacity: 0.5,
  },
  active: {
    opacity: 1.0,
  },
});

export default FederationWizardSceen;
