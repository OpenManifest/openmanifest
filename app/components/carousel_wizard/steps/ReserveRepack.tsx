import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card, List } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { DatePickerField } from 'app/components/input/date_picker';
import { useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';

export const validation = yup.object({
  repackExpiresAt: yup
    .number()
    .required('Please enter the date of your next repack')
    .transform((value) => {
      console.debug('Transforming repackExpiresAt', value, Number(value));
      return value ? Number(value) : undefined;
    })
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        repackExpiresAt: dropzoneUser?.user?.rigs?.[0]?.repackExpiresAt || undefined
      },
      validation
    }),
    [dropzoneUser?.user?.rigs]
  );
}

function ReserveRepackStep(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title="Next reserve repack?">
      <Fields>
        <Card style={styles.card}>
          <List.Subheader>Due date</List.Subheader>
          <DatePickerField {...{ control }} name="repackExpiresAt" label="Reserve repack due date" />
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
  field: {
    marginBottom: 8
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column'
  },
  card: { padding: 8, marginVertical: 16 },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 80,
    textAlign: 'center'
  }
});

export default ReserveRepackStep;
