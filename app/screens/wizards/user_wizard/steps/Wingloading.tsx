import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Paragraph } from 'react-native-paper';
import { ceil } from 'lodash';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import NumberField, { NumberFieldType } from 'app/components/input/number_input/NumberField';

function WingloadingWizardScreen(props: IWizardStepProps) {
  const rigForm = useAppSelector((root) => root.forms.rig);
  const userForm = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  return (
    <Step {...props} title="Wing Loading">
      <Fields>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={styles.wingLoadingCardLeft}>
            <Avatar.Text
              label={ceil(
                (2.205 * Number(userForm.fields.exitWeight.value || 50)) /
                  (rigForm.fields.canopySize.value || 150),
                2
              ).toString()}
              size={100}
              style={styles.wingLoading}
            />
          </View>
          <View style={styles.wingLoadingCardRight}>
            <Card.Title title="Your wingloading" style={{ paddingLeft: 0 }} />
            <Paragraph>
              Your wingloading is an indicator of your descent rate under canopy
            </Paragraph>
          </View>
        </View>

        <Card style={styles.card} elevation={3}>
          <NumberField
            label="Your exit weight"
            variant={NumberFieldType.Weight}
            value={Number(userForm?.fields?.exitWeight?.value) || 50}
            onChange={(value) =>
              dispatch(actions.forms.user.setField(['exitWeight', value.toString()]))
            }
            error={userForm.fields.exitWeight?.error}
            helperText="Your weight in kg's with all equipment on"
          />
          <NumberField
            label="Canopy Size"
            variant={NumberFieldType.CanopySize}
            value={Number(rigForm?.fields?.canopySize?.value) || 120}
            onChange={(value) => dispatch(actions.forms.rig.setField(['canopySize', value]))}
            helperText="Size of your main canopy in square feet"
            error={userForm.fields.exitWeight?.error}
          />
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
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  card: { padding: 8, paddingRight: 16, marginVertical: 16 },
  cardTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardValue: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    marginBottom: 50,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
  },
  field: {
    marginVertical: 8,
  },
  slider: {
    flexDirection: 'column',
  },
  sliderControl: { width: '100%', height: 40 },
  wingLoading: {
    alignSelf: 'center',
  },
  wingLoadingCardLeft: {
    width: '30%',
  },
  wingLoadingCardRight: {
    paddingLeft: 16,
    width: '70%',
  },
});

export default WingloadingWizardScreen;
