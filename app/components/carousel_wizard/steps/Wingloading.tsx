import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Paragraph } from 'react-native-paper';
import { ceil } from 'lodash';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { NumberFieldType } from 'app/components/input/number_input/NumberField';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';

export const validation = yup.object({
  canopySize: yup.number().required('Please enter your canopy size in square feet'),
  exitWeight: yup.number().required('Enter your exit weight').default(70)
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        canopySize: dropzoneUser?.user?.rigs?.[0]?.canopySize ? Number(dropzoneUser?.user?.rigs?.[0]?.canopySize) : 150,
        exitWeight: dropzoneUser?.user?.exitWeight ? parseFloat(dropzoneUser?.user?.exitWeight) : 70
      },
      validation
    }),
    [dropzoneUser?.user?.exitWeight, dropzoneUser?.user?.rigs]
  );
}

function WingloadingWizardScreen(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();

  const { canopySize, exitWeight } = useWatch({ control });
  return (
    <Step {...props} title="Wing Loading">
      <Fields>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <View style={styles.wingLoadingCardLeft}>
            <Avatar.Text
              label={ceil((2.205 * Number(exitWeight || 50)) / Number(canopySize || 150), 2).toString()}
              size={100}
              style={styles.wingLoading}
            />
          </View>
          <View style={styles.wingLoadingCardRight}>
            <Card.Title title="Your wingloading" style={{ paddingLeft: 0 }} />
            <Paragraph>Your wingloading is an indicator of your descent rate under canopy</Paragraph>
          </View>
        </View>

        <Card style={styles.card} elevation={3}>
          <FormNumberField
            {...{ control }}
            name="exitWeight"
            label="Your exit weight"
            variant={NumberFieldType.Weight}
            helperText="Your weight in kg's with all equipment on"
          />
          <FormNumberField
            {...{ control }}
            name="canopySize"
            label="Canopy Size"
            variant={NumberFieldType.CanopySize}
            helperText="Size of your main canopy in square feet"
          />
        </Card>
      </Fields>
    </Step>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center'
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column'
  },
  card: { padding: 8, paddingRight: 16, marginVertical: 16 },
  cardTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cardValue: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
    alignSelf: 'center'
  },
  title: {
    color: 'white',
    marginBottom: 50,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center'
  },
  field: {
    marginVertical: 8
  },
  slider: {
    flexDirection: 'column'
  },
  sliderControl: { width: '100%', height: 40 },
  wingLoading: {
    alignSelf: 'center'
  },
  wingLoadingCardLeft: {
    width: '30%'
  },
  wingLoadingCardRight: {
    paddingLeft: 16,
    width: '70%'
  }
});

export default WingloadingWizardScreen;
