import * as React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderThemed } from 'app/ui/components/testing';
import GuestsEditor from '../GuestsEditor';
import { emptyGuest } from '../guests';

describe('<GuestsEditor />', () => {
  it('adds a guest up to what one escort takes, and takes one off', async () => {
    const onChange = jest.fn();
    const one = await renderThemed(
      <GuestsEditor escort="Ivy" guests={[emptyGuest()]} capacity={2} onChange={onChange} />
    );
    expect(one.getByTestId('picker-guests-0-name')).toBeTruthy();
    expect(one.queryByTestId('picker-guests-0-remove')).toBeNull();
    await fireEvent.press(one.getByTestId('picker-guests-add'));
    expect(onChange).toHaveBeenCalledWith([emptyGuest(), emptyGuest()]);

    const full = await renderThemed(
      <GuestsEditor
        escort="Ivy"
        guests={[emptyGuest(), emptyGuest()]}
        capacity={2}
        onChange={onChange}
      />
    );

    expect(full.queryByTestId('picker-guests-add')).toBeNull();
    await fireEvent.press(full.getByTestId('picker-guests-1-remove'));
    expect(onChange).toHaveBeenLastCalledWith([emptyGuest()]);
  });

  it('writes what is typed into the guest, and asks for a date of birth when the ticket needs one', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await renderThemed(
      <GuestsEditor
        escort="Ivy"
        guests={[emptyGuest()]}
        capacity={1}
        dateOfBirth
        onChange={onChange}
      />
    );

    await fireEvent.changeText(getByTestId('picker-guests-0-name'), 'Gus');
    expect(onChange).toHaveBeenCalledWith([{ name: 'Gus', bodyMassKg: null, dateOfBirth: '' }]);
    expect(getByTestId('picker-guests-0-dob')).toBeTruthy();
    expect(getByTestId('picker-guests-problem')).toBeTruthy();
  });
});
