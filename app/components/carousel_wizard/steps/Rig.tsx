import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import Select from 'app/components/input/select/Select';
import { Controller, useFormContext } from 'react-hook-form';
import { FormTextField } from 'app/components/input/text/TextField';

import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';

export const validation = yup.object({
  rigId: yup.string().nullable().default(null),
  make: yup.string().required('Please select a manufacturer').default('Icon'),
  model: yup.string().required('Please enter the model of your container'),
  serial: yup.string().required('Serial number makes it faster to identify and inspect your container')
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        make: dropzoneUser?.user?.rigs?.[0]?.make || '',
        model: dropzoneUser?.user?.rigs?.[0]?.model || '',
        serial: dropzoneUser?.user?.rigs?.[0]?.serial || '',
        rigId: dropzoneUser?.user?.rigs?.[0]?.id || null
      },
      validation
    }),
    [dropzoneUser?.user?.rigs]
  );
}

function RigWizardScreen(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();
  const [isOtherMake, setIsOtherMake] = React.useState(false);

  return (
    <Step {...props} title="Your rig">
      <Fields>
        <Controller
          {...{ control }}
          name="make"
          render={({ field: { value, onChange }, fieldState }) => (
            <>
              <Select<string>
                label="Manufacturer"
                onChange={(value) => {
                  setIsOtherMake(value === 'other');
                  onChange(value);
                }}
                {...{ value }}
                options={[
                  'Icon',
                  'Javelin',
                  'Mirage',
                  'Vector / UPT',
                  'PA (Talon)',
                  'Infinity',
                  'Parachutes de France',
                  'Parachute Systems',
                  'Racer'
                ]
                  .map((label) => ({ label, value: label }))
                  .concat([{ label: 'Other', value: 'other' }])}
              />
            </>
          )}
        />

        {!isOtherMake ? null : (
          <Surface style={styles.card}>
            <FormTextField
              {...{ control }}
              name="make"
              style={{ backgroundColor: 'transparent' }}
              mode="flat"
              label="Other manufacturer"
            />
          </Surface>
        )}

        <Surface style={styles.card}>
          <FormTextField
            {...{ control }}
            name="model"
            style={{ backgroundColor: 'transparent' }}
            mode="flat"
            label="Model"
          />
        </Surface>
        <Surface style={styles.card}>
          <FormTextField
            {...{ control }}
            name="serial"
            style={{ backgroundColor: 'transparent' }}
            mode="flat"
            label="Serial number"
          />
        </Surface>
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
    marginBottom: 8,
    backgroundColor: 'transparent',
    marginVertical: 16
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column'
  },
  card: { marginVertical: 8 },
  title: {
    color: 'white',
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold'
  }
});

export default RigWizardScreen;
