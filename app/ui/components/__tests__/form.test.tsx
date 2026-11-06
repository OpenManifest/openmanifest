import * as React from 'react';
import { Text as NativeText } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import Chip from '../form/Chip';
import NumberField, { FormNumberField, parseNumber } from '../form/NumberField';
import Segmented from '../form/Segmented';
import Select from '../form/Select';
import Switch from '../form/Switch';
import TextField, { FormTextField } from '../form/TextField';
import { colours, flat, onPlatform, renderThemed, SCHEMES } from '../testing';

describe('TextField', () => {
  it('names the input by its label and shows the value', async () => {
    const screen = await renderThemed(<TextField label="Name" value="Olive" />);

    expect(screen.getByLabelText('Name').props.value).toBe('Olive');
    expect(screen.getByText('Name')).toBeTruthy();
  });

  it('reports what is typed', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(<TextField label="Name" value="" onChange={onChange} />);

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Ola');

    expect(onChange).toHaveBeenCalledWith('Ola');
  });

  it('shows the helper text, and the error instead of it, announced as an alert', async () => {
    const helper = await renderThemed(<TextField label="Name" helperText="As on your licence" />);
    expect(helper.getByText('As on your licence').props.role).toBeUndefined();

    const wrong = await renderThemed(
      <TextField label="Name" helperText="As on your licence" error="Required" />
    );
    const message = wrong.getByText('Required');
    expect(wrong.queryByText('As on your licence')).toBeNull();
    expect(message.props.role).toBe('alert');
    expect(message.props['aria-live']).toBe('polite');
    expect(wrong.getByLabelText('Name').props['aria-invalid']).toBe(true);
  });

  it('cannot be edited while disabled', async () => {
    const screen = await renderThemed(<TextField label="Name" disabled />);

    expect(screen.getByLabelText('Name').props.editable).toBe(false);
  });

  it('shows a suffix after the text', async () => {
    const screen = await renderThemed(<TextField label="Weight" suffix="kg" />);

    expect(screen.getByText('kg')).toBeTruthy();
  });

  it.each(SCHEMES)('marks an error with a thicker, red border in the %s scheme', async (scheme) => {
    const screen = await renderThemed(<TextField label="Name" error="Required" />, { scheme });
    const box = screen.getByLabelText('Name').parent as unknown as { props: { style: unknown } };

    expect(flat(box)).toMatchObject({
      borderWidth: 2,
      borderColor: colours[scheme].status.blocked.fg,
    });
  });

  it.each([
    ['compact', 48],
    ['regular', 48],
    ['comfortable', 56],
  ] as const)('is %s: the box is at least %d dp high on Android', async (density, height) => {
    await onPlatform('android', async () => {
      const screen = await renderThemed(<TextField label="Name" />, { density });
      const box = screen.getByLabelText('Name').parent as unknown as { props: { style: unknown } };

      expect(flat(box).minHeight).toBe(height);
    });
  });
});

describe('FormTextField', () => {
  function Form({ onSubmit }: { onSubmit(values: { name: string }): void }) {
    const { control, handleSubmit } = useForm({ defaultValues: { name: '' } });
    return (
      <>
        <FormTextField
          control={control}
          name="name"
          label="Name"
          rules={{ required: 'Name is required' }}
        />
        <NativeText onPress={handleSubmit(onSubmit)}>Send</NativeText>
      </>
    );
  }

  it('announces the validation message of the field, then accepts a value', async () => {
    const onSubmit = jest.fn();
    const screen = await renderThemed(<Form onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByText('Send'));
    await waitFor(() => expect(screen.getByText('Name is required').props.role).toBe('alert'));
    expect(onSubmit).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Olive');
    await fireEvent.press(screen.getByText('Send'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'Olive' });
  });
});

describe('parseNumber', () => {
  it.each([
    ['12', 12],
    [' 12.5 ', 12.5],
    ['12,5', 12.5],
    ['-3', -3],
    ['', null],
    ['  ', null],
    ['abc', null],
  ])('reads %p as %p', (text, number) => {
    expect(parseNumber(text)).toBe(number);
  });
});

describe('NumberField', () => {
  it('is a spin button named by its label, with its value and limits', async () => {
    const screen = await renderThemed(
      <NumberField label="Weight" value={80} min={30} max={200} unit="kg" />
    );
    const input = screen.getByLabelText('Weight');

    expect(input.props.role).toBe('spinbutton');
    expect(input.props.accessibilityValue).toMatchObject({ min: 30, max: 200, now: 80 });
    expect(input.props.value).toBe('80');
    expect(screen.getByText('kg')).toBeTruthy();
  });

  it('steps with the buttons within the limits', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <NumberField label="Weight" value={80} min={79} max={81} step={1} onChange={onChange} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Increase Weight' }));
    expect(onChange).toHaveBeenLastCalledWith(81);
    // The field keeps its own text between changes of `value`: one step down from 81 is 80
    await fireEvent.press(screen.getByRole('button', { name: 'Decrease Weight' }));
    expect(onChange).toHaveBeenLastCalledWith(80);
  });

  it('disables the button at a limit', async () => {
    const screen = await renderThemed(<NumberField label="Weight" value={30} min={30} max={200} />);

    expect(screen.getByRole('button', { name: 'Decrease Weight', disabled: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Increase Weight', disabled: false })).toBeTruthy();
  });

  it('steps by fractions without rounding noise', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <NumberField label="Size" value={0.1} step={0.2} onChange={onChange} />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Increase Size' }));

    expect(onChange).toHaveBeenLastCalledWith(0.3);
  });

  it('steps with the arrow keys', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <NumberField label="Weight" value={80} onChange={onChange} />
    );

    await fireEvent(screen.getByLabelText('Weight'), 'keyPress', {
      nativeEvent: { key: 'ArrowUp' },
    });
    expect(onChange).toHaveBeenLastCalledWith(81);
    await fireEvent(screen.getByLabelText('Weight'), 'keyPress', {
      nativeEvent: { key: 'ArrowDown' },
    });
    expect(onChange).toHaveBeenLastCalledWith(80);
  });

  it('takes typing as it comes, a comma as a decimal point, and empty as null', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <NumberField label="Weight" value={80} onChange={onChange} />
    );
    const input = screen.getByLabelText('Weight');

    await fireEvent.changeText(input, '72,5');
    expect(onChange).toHaveBeenLastCalledWith(72.5);
    await fireEvent.changeText(input, '');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('brings the number within the limits when the field loses focus', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <NumberField label="Weight" value={80} min={30} max={200} onChange={onChange} />
    );
    const input = screen.getByLabelText('Weight');

    await fireEvent.changeText(input, '500');
    await fireEvent(input, 'blur');

    expect(onChange).toHaveBeenLastCalledWith(200);
  });

  it('follows a value that changes from outside', async () => {
    const screen = await renderThemed(<NumberField label="Weight" value={80} />);

    await screen.rerender(<NumberField label="Weight" value={90} />);

    await waitFor(() => expect(screen.getByLabelText('Weight').props.value).toBe('90'));
  });

  it('can do without the buttons, and announces an error', async () => {
    const screen = await renderThemed(
      <NumberField label="Weight" value={80} hideSteppers error="Too heavy" />
    );

    expect(screen.queryByRole('button', { name: 'Increase Weight' })).toBeNull();
    expect(screen.getByText('Too heavy').props.role).toBe('alert');
  });

  it('works as a form field', async () => {
    function Form() {
      const { control } = useForm({ defaultValues: { weight: 80 as number | null } });
      return <FormNumberField control={control} name="weight" label="Weight" />;
    }
    const screen = await renderThemed(<Form />);

    await fireEvent.press(screen.getByRole('button', { name: 'Increase Weight' }));

    await waitFor(() => expect(screen.getByLabelText('Weight').props.value).toBe('81'));
  });
});

describe('Select', () => {
  const options = [
    { value: 'a', label: 'Caravan' },
    { value: 'b', label: 'Otter' },
    { value: 'c', label: 'Skyvan', disabled: true },
  ];

  it('is a combobox named by its label that shows the choice or the placeholder', async () => {
    const empty = await renderThemed(
      <Select label="Aircraft" options={options} placeholder="Pick one" />
    );
    expect(empty.getByRole('combobox', { name: 'Aircraft' })).toBeTruthy();
    expect(empty.getByText('Pick one')).toBeTruthy();

    const chosen = await renderThemed(<Select label="Aircraft" options={options} value="b" />);
    expect(chosen.getByText('Otter')).toBeTruthy();
  });

  it('opens a list of options with the chosen one selected, and chooses one', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <Select label="Aircraft" options={options} value="a" onChange={onChange} />
    );

    await fireEvent.press(screen.getByRole('combobox', { name: 'Aircraft' }));
    expect(screen.getByRole('combobox', { name: 'Aircraft', expanded: true })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Caravan', selected: true })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Otter', selected: false })).toBeTruthy();

    await fireEvent.press(screen.getByRole('option', { name: 'Otter' }));

    expect(onChange).toHaveBeenCalledWith('b');
    await waitFor(() => expect(screen.queryByRole('option', { name: 'Otter' })).toBeNull());
  });

  it('does not choose a disabled option', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <Select label="Aircraft" options={options} onChange={onChange} />
    );

    await fireEvent.press(screen.getByRole('combobox', { name: 'Aircraft' }));
    await fireEvent.press(screen.getByRole('option', { name: 'Skyvan' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes from the backdrop without choosing', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <Select label="Aircraft" options={options} onChange={onChange} />
    );

    await fireEvent.press(screen.getByRole('combobox', { name: 'Aircraft' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('option', { name: 'Caravan' })).toBeNull());
  });

  it('does not open while disabled', async () => {
    const screen = await renderThemed(<Select label="Aircraft" options={options} disabled />);

    await fireEvent.press(screen.getByRole('combobox', { name: 'Aircraft' }));

    expect(screen.queryByRole('option', { name: 'Caravan' })).toBeNull();
  });
});

describe('Segmented', () => {
  const options = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System', disabled: true },
  ];

  it('is a radio group named by its label with one radio checked', async () => {
    const screen = await renderThemed(<Segmented label="Theme" options={options} value="dark" />);

    expect(screen.getByLabelText('Theme').props.role).toBe('radiogroup');
    expect(screen.getByRole('radio', { name: 'Dark', checked: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Light', checked: false })).toBeTruthy();
  });

  it('chooses the pressed segment, but not a disabled one', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <Segmented label="Theme" options={options} value="dark" onChange={onChange} />
    );

    await fireEvent.press(screen.getByRole('radio', { name: 'Light' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'System' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('light');
  });

  it.each(SCHEMES)(
    'fills the chosen segment with the soft brand in the %s scheme',
    async (scheme) => {
      const screen = await renderThemed(
        <Segmented label="Theme" options={options} value="dark" />,
        {
          scheme,
        }
      );

      expect(flat(screen.getByRole('radio', { name: 'Dark' })).backgroundColor).toBe(
        colours[scheme].brandSoft
      );
      expect(flat(screen.getByRole('radio', { name: 'Light' })).backgroundColor).toBe(
        colours[scheme].surface
      );
    }
  );
});

describe('Switch', () => {
  it('is a switch named by its label that says whether it is on', async () => {
    const screen = await renderThemed(
      <>
        <Switch label="Notifications" value />
        <Switch label="Sounds" value={false} />
      </>
    );

    expect(screen.getByRole('switch', { name: 'Notifications', checked: true })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Sounds', checked: false })).toBeTruthy();
  });

  it('reports the opposite when pressed, unless disabled', async () => {
    const onChange = jest.fn();
    const screen = await renderThemed(
      <>
        <Switch label="Notifications" value onChange={onChange} />
        <Switch label="Sounds" value={false} disabled onChange={onChange} />
      </>
    );

    await fireEvent.press(screen.getByRole('switch', { name: 'Notifications' }));
    await fireEvent.press(screen.getByRole('switch', { name: 'Sounds' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('announces an error', async () => {
    const screen = await renderThemed(<Switch label="Terms" error="Accept the terms" />);

    expect(screen.getByText('Accept the terms').props.role).toBe('alert');
  });
});

describe('Chip', () => {
  it('is a checkbox when it filters, checked when selected', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(
      <>
        <Chip label="Tandem" selected onPress={onPress} />
        <Chip label="Student" onPress={onPress} />
      </>
    );

    expect(screen.getByRole('checkbox', { name: 'Tandem', checked: true })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Student', checked: false })).toBeTruthy();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Student' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a value with a remove button named after it, as an input chip', async () => {
    const onRemove = jest.fn();
    const screen = await renderThemed(
      <Chip variant="input" label="Olive Owner" onRemove={onRemove} />
    );

    expect(screen.getByText('Olive Owner')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Olive Owner' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('keeps a small chip and a touch target of the platform size', async () => {
    await onPlatform('android', async () => {
      const screen = await renderThemed(<Chip label="Tandem" onPress={jest.fn()} />);
      const chip = screen.getByRole('checkbox', { name: 'Tandem' });

      expect(flat(chip).height).toBe(32);
      expect(chip.props.hitSlop).toBeGreaterThanOrEqual(8);
    });
  });

  it('ignores presses while disabled', async () => {
    const onPress = jest.fn();
    const screen = await renderThemed(<Chip label="Tandem" disabled onPress={onPress} />);

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Tandem' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
