import * as React from 'react';
import { View } from 'react-native';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { fireEvent, render, within } from '../../../__mocks__/render';
import GuestsInput from '../GuestsInput';
import type { GuestValue } from '../guests';

jest.setTimeout(30000);

async function renderInput(value: GuestValue[], capacity: number) {
  const onChange = jest.fn();
  const screen = await render(
    <View testID="under-test">
      <GuestsInput {...{ value, capacity, onChange }} />
    </View>,
    { session: authenticatedSession, graphql: [] }
  );
  return { onChange, input: within(screen.getByTestId('under-test')) };
}

describe('<GuestsInput />', () => {
  it('adds a guest while there is room', async () => {
    const { input, onChange } = await renderInput([], 2);

    fireEvent.press(input.getByTestId('add-guest'));

    expect(onChange).toHaveBeenCalledWith([{ name: '', bodyMassKg: null }]);
  });

  it('offers no more guests than the ticket takes', async () => {
    const { input } = await renderInput([{ name: 'Pat', bodyMassKg: 70 }], 1);

    expect(input.queryByTestId('add-guest')).toBeNull();
  });

  it('changes the name of a guest and removes a guest', async () => {
    const guests = [
      { name: 'Pat', bodyMassKg: 70 },
      { name: 'Sam', bodyMassKg: 80 },
    ];
    const { input, onChange } = await renderInput(guests, 4);

    fireEvent.changeText(input.getByTestId('guest-name-1'), 'Samira');
    expect(onChange).toHaveBeenLastCalledWith([guests[0], { ...guests[1], name: 'Samira' }]);

    fireEvent.press(within(input.getByTestId('guest-0')).getByLabelText('Remove guest'));
    expect(onChange).toHaveBeenLastCalledWith([guests[1]]);
  });
});
