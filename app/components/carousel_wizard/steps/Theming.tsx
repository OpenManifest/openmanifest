import * as React from 'react';
import { View } from 'react-native';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { PhonePreview, WebPreview } from 'app/components/theme_preview';
import ColorPicker from 'app/components/input/colorpicker';
import * as yup from 'yup';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useDropzoneContext } from 'app/providers';
import { useMemo } from 'app/hooks/react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

export const validation = yup.object({
  primaryColor: yup.string().required().default('#000000')
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const {
    dropzone: { dropzone }
  } = useDropzoneContext();

  return useMemo(
    () => ({
      defaultValues: {
        primaryColor: dropzone?.primaryColor || '#000000'
      },
      validation
    }),
    [dropzone?.primaryColor]
  );
}

function ThemingStep(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();
  const { primaryColor } = useWatch({ control });

  return (
    <Step {...props} title="Branding">
      <Fields>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-evenly'
          }}
        >
          <PhonePreview primaryColor={primaryColor || '#000000'} />

          <WebPreview primaryColor={primaryColor || '#000000'} />
        </View>

        <Controller
          name="primaryColor"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <ColorPicker
              {...{ onChange, value }}
              title="Brand color"
              helperText="This color is used for active elements and calls to action"
              error={error?.message}
            />
          )}
        />
      </Fields>
    </Step>
  );
}

export default ThemingStep;
