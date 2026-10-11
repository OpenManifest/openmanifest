import * as React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import ColorPicker from '../../components/input/colorpicker';
import { COLOR_PRESETS } from '../../components/input/colorpicker/ColorPicker';

function renderPicker(value: string, onChange = jest.fn()) {
  const screen = render(
    <PaperProvider>
      <ColorPicker
        title="Primary color"
        helperText="Used for buttons"
        value={value}
        onChange={onChange}
      />
    </PaperProvider>
  );
  return { screen, onChange };
}

describe('<ColorPicker />', () => {
  it('offers 16 preset swatches', () => {
    expect(COLOR_PRESETS).toHaveLength(16);
    const { screen } = renderPicker('#000000');
    expect(screen.getAllByLabelText(/^Color #/)).toHaveLength(16);
    expect(screen.getByText('Used for buttons')).toBeTruthy();
  });

  it('reports the preset that is pressed', () => {
    const { screen, onChange } = renderPicker('#000000');
    fireEvent.press(screen.getByLabelText('Color #1E47AB'));
    expect(onChange).toHaveBeenCalledWith('#1E47AB');
  });

  it('reports a typed hex color once it is complete', () => {
    const { screen, onChange } = renderPicker('#000000');
    const input = screen.getByDisplayValue('#000000');
    fireEvent.changeText(input, '#12AB');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.changeText(input, '#12ab9f');
    expect(onChange).toHaveBeenCalledWith('#12ab9f');
  });

  it('adds the missing # and rejects values that are not hex colors', () => {
    const { screen, onChange } = renderPicker('#000000');
    const input = screen.getByDisplayValue('#000000');
    fireEvent.changeText(input, '12ab9f');
    expect(onChange).toHaveBeenCalledWith('#12ab9f');

    onChange.mockClear();
    fireEvent.changeText(input, '#GGGGGG');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Use a hex color such as #1D3557')).toBeTruthy();
  });
});
