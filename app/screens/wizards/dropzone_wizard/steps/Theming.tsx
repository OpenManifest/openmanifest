import * as React from 'react';
import { useController } from 'react-hook-form';
import { View } from 'react-native';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { useDropzoneWizardFields } from '../useDropzoneWizardForm';
import { PhonePreview, WebPreview } from 'app/components/theme_preview';
import ColorPicker from 'app/components/input/colorpicker';

function ThemingStep(props: IWizardStepProps) {
  const { control, setField } = useDropzoneWizardFields();
  const { field, fieldState } = useController({ name: 'primaryColor', control });

  return (
    <Step {...props} title="Branding">
      <Fields>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-evenly',
          }}
        >
          <PhonePreview primaryColor={field.value || '#000000'} />

          <WebPreview primaryColor={field.value || '#000000'} />
        </View>

        <ColorPicker
          title="Brand color"
          helperText="This color is used for active elements and calls to action"
          error={fieldState.error?.message}
          onChange={(color) => setField('primaryColor', color)}
          value={field.value || '#000000'}
        />
      </Fields>
    </Step>
  );
}

export default ThemingStep;
