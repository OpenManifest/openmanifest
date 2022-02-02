import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card, HelperText, List } from 'react-native-paper';
import DatePicker from 'app/components/input/date_picker/DatePicker';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function ReserveRepackStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.rig);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Next reserve repack?">
      <Fields>
        <Card style={styles.card}>
          <List.Subheader>Due date</List.Subheader>
          <DatePicker
            label="Reserve repack due date"
            timestamp={state.fields.repackExpiresAt.value || new Date().getTime() / 1000}
            onChange={(time) => dispatch(actions.forms.rig.setField(['repackExpiresAt', time]))}
          />
          <HelperText type={state.fields.repackExpiresAt.error ? 'error' : 'info'}>
            {state.fields.repackExpiresAt.error || ''}
          </HelperText>
        </Card>
      </Fields>
    </Step>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  field: {
    marginBottom: 8,
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  card: { padding: 8, marginVertical: 16 },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 80,
    textAlign: 'center',
  },
});

export default ReserveRepackStep;
