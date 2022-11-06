import * as React from 'react';
import { View } from 'react-native';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { PhonePreview, WebPreview } from 'app/components/theme_preview';
import ColorPicker from 'app/components/input/colorpicker';

function ThemingStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();

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
          <PhonePreview primaryColor={state.fields.primaryColor.value || '#000000'} />

          <WebPreview primaryColor={state.fields.primaryColor.value || '#000000'} />
        </View>

        <ColorPicker
          title="Brand color"
          helperText="This color is used for active elements and calls to action"
          error={state.fields.primaryColor.error}
          onChange={(color) => dispatch(actions.forms.dropzone.setField(['primaryColor', color]))}
          value={state.fields.primaryColor.value || '#000000'}
        />
      </Fields>
    </Step>
  );
}

export default ThemingStep;
