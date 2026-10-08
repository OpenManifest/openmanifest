import * as React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import NumberField, { NumberFieldType } from '../../components/input/number_input/NumberField';

function Harness(props: Partial<React.ComponentProps<typeof NumberField>> & { onValue?: (v: number) => void }) {
  const { onValue, value: initial = 80, ...rest } = props;
  const [value, setValue] = React.useState<number>(initial as number);
  return (
    <PaperProvider>
      <NumberField
        label="Exit weight"
        {...rest}
        value={value}
        onChange={(next) => {
          setValue(next);
          onValue?.(next);
        }}
      />
    </PaperProvider>
  );
}

describe('<NumberField />', () => {
  it('shows the label, the value and the unit of the variant', () => {
    const screen = render(<Harness variant={NumberFieldType.Weight} />);
    expect(screen.getByText('Exit weight')).toBeTruthy();
    expect(screen.getByDisplayValue('80')).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
  });

  it('steps with the plus and minus buttons', () => {
    const onValue = jest.fn();
    const screen = render(<Harness onValue={onValue} step={2.5} />);
    fireEvent.press(screen.getByLabelText('Increase'));
    expect(onValue).toHaveBeenLastCalledWith(82.5);
    expect(screen.getByDisplayValue('82.5')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Decrease'));
    fireEvent.press(screen.getByLabelText('Decrease'));
    expect(onValue).toHaveBeenLastCalledWith(77.5);
  });

  it('reports typed numbers and ignores text that is not a number', () => {
    const onValue = jest.fn();
    const screen = render(<Harness onValue={onValue} />);
    const input = screen.getByDisplayValue('80');
    fireEvent.changeText(input, '91,5');
    expect(onValue).toHaveBeenLastCalledWith(91.5);
    onValue.mockClear();
    fireEvent.changeText(input, 'abc');
    fireEvent.changeText(input, '');
    expect(onValue).not.toHaveBeenCalled();
  });

  it('stops at min and max and disables the button at the limit', () => {
    const onValue = jest.fn();
    const screen = render(<Harness onValue={onValue} value={41} step={5} min={40} max={45} />);
    fireEvent.press(screen.getByLabelText('Decrease'));
    expect(onValue).toHaveBeenLastCalledWith(40);
    expect(screen.getByLabelText('Decrease').props.accessibilityState?.disabled).toBe(true);
    fireEvent.changeText(screen.getByDisplayValue('40'), '99');
    expect(onValue).toHaveBeenLastCalledWith(45);
  });

  it('shows the error instead of the helper text', () => {
    const screen = render(<Harness helperText="Without gear" error="Too heavy" />);
    expect(screen.getByText('Too heavy')).toBeTruthy();
    expect(screen.queryByText('Without gear')).toBeNull();
  });
});
