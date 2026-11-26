import * as React from 'react';
import { View } from 'react-native';
import { fireEvent, render, within } from '../../../../__mocks__/render';
import ChipSelect from '../ChipSelect';

type Body = { id: string; name: string };
const bodies: Body[] = [
  { id: '1', name: 'PADI' },
  { id: '2', name: 'SSI' },
  { id: '3', name: 'NAUI' },
];

function Several() {
  const [value, setValue] = React.useState<Body[]>([]);
  return (
    <View testID="under-test">
      <ChipSelect<Body>
        allowEmpty
        items={bodies}
        value={value}
        renderItemLabel={(body) => body.name}
        onChange={setValue}
      />
    </View>
  );
}

describe('<ChipSelect />', () => {
  // BUG-132: the memo compared a prop that does not exist instead of `value`, so a pressed chip never showed as chosen
  it('shows each chip pressed as chosen, and adds the second to the first', async () => {
    const screen = await render(<Several />, { graphql: [] });
    const select = within(screen.getByTestId('under-test'));

    await fireEvent.press(select.getByRole('checkbox', { name: 'PADI' }));
    await fireEvent.press(select.getByRole('checkbox', { name: 'SSI' }));

    expect(select.getByRole('checkbox', { name: 'PADI', checked: true })).toBeTruthy();
    expect(select.getByRole('checkbox', { name: 'SSI', checked: true })).toBeTruthy();
    expect(select.getByRole('checkbox', { name: 'NAUI', checked: false })).toBeTruthy();

    await fireEvent.press(select.getByRole('checkbox', { name: 'PADI' }));
    expect(select.getByRole('checkbox', { name: 'PADI', checked: false })).toBeTruthy();
  });
});
