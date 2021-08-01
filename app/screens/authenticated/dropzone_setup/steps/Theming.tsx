import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import WizardScreen, { IWizardScreenProps } from '../../../../components/wizard/WizardScreen';
import { actions, useAppDispatch, useAppSelector } from '../../../../state';
import { PhonePreview, WebPreview } from '../../../../components/theme_preview';
import ColorPicker from '../../../../components/input/colorpicker';

function ReserveRepackWizardScreen(props: IWizardScreenProps) {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();

  return (
    <WizardScreen style={styles.container} {...props} title="Branding">
      <View style={styles.content}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-evenly',
          }}
        >
          <PhonePreview
            primaryColor={state.fields.primaryColor.value || '#000000'}
            secondaryColor={state.fields.secondaryColor.value || '#ffffff'}
          />

          <WebPreview
            primaryColor={state.fields.primaryColor.value || '#000000'}
            secondaryColor={state.fields.secondaryColor.value || '#ffffff'}
          />
        </View>

        <ColorPicker
          title="Primary color"
          helperText="Primary color is used for elements like the title bar and the tab bar"
          error={state.fields.primaryColor.error}
          onChange={(color) => dispatch(actions.forms.dropzone.setField(['primaryColor', color]))}
          value={state.fields.primaryColor.value || '#000000'}
        />

        <ColorPicker
          title="Accent color"
          helperText="Accent color is used for highlights, like buttons and loading bars"
          error={state.fields.secondaryColor.error}
          onChange={(color) => dispatch(actions.forms.dropzone.setField(['secondaryColor', color]))}
          value={state.fields.secondaryColor.value || '#FFFFFF'}
        />
      </View>
    </WizardScreen>
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

  colorBox: {
    height: 25,
    width: 25,
    margin: 5,
  },
});

export default ReserveRepackWizardScreen;
