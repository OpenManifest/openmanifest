import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import * as yup from 'yup';
import { useDropzoneContext } from 'app/providers';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { useMemo } from 'app/hooks/react';
import LocationWizardPicker from './Picker';

export const validation = yup.object({
  coords: yup.object({
    lat: yup.number().required(),
    lng: yup.number().required()
  })
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const {
    dropzone: { dropzone }
  } = useDropzoneContext();

  return useMemo(
    () => ({
      defaultValues: {
        coords: {
          lat: dropzone?.lat || 0,
          lng: dropzone?.lng || 0
        }
      },
      validation
    }),
    [dropzone?.lat, dropzone?.lng]
  );
}

export function LocationStep(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title="Dropzone">
      <Fields>
        <Controller
          name="coords"
          render={({ field: { onChange, value } }) => (
            <LocationWizardPicker {...{ control }} coords={value} onChange={onChange} />
          )}
        />
      </Fields>
    </Step>
  );
}
export default LocationStep;
