import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, HelperText, TextInput } from 'react-native-paper';
import WizardScreen, { IWizardScreenProps } from '../../../wizard/WizardScreen';
import { actions, useAppDispatch, useAppSelector } from '../../../../state';

function UserInfoScreen(props: IWizardScreenProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container} {...props} title="About you">
      <View style={styles.content}>
        <Card style={styles.card}>
          <TextInput
            value={state.fields?.name?.value || ''}
            mode="outlined"
            onChangeText={(newValue) => dispatch(actions.forms.user.setField(['name', newValue]))}
            label="Full name"
          />
          <HelperText type={state.fields.name.error ? 'error' : 'info'}>
            {state.fields.name.error || ''}
          </HelperText>
        </Card>
        <Card style={styles.card}>
          <TextInput
            value={state.fields?.nickname?.value || ''}
            mode="outlined"
            onChangeText={(newValue) =>
              dispatch(actions.forms.user.setField(['nickname', newValue]))
            }
            label="Nickname"
          />
          <HelperText type={state.fields.nickname.error ? 'error' : 'info'}>
            {state.fields.nickname.error || 'This will be displayed as your preferred name'}
          </HelperText>
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

export default UserInfoScreen;
