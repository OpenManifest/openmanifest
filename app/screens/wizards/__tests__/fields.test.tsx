import * as React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { createFieldsContext, useFieldState } from '../fields';

const [FieldsProvider, useFields] = createFieldsContext<'email' | 'password'>('Test');

function Step() {
  const { values, errors, setValue } = useFields();
  return (
    <>
      <Text testID="email">{values.email}</Text>
      <Text testID="error">{errors.email ?? 'none'}</Text>
      <Text testID="change" onPress={() => setValue('email', 'a@b.c')}>
        change
      </Text>
    </>
  );
}

function Screen(props: { onFields?: (fields: ReturnType<typeof useFieldState>) => void }) {
  const fields = useFieldState({ email: '', password: '' });
  props.onFields?.(fields as never);
  return (
    <FieldsProvider value={fields}>
      <Step />
    </FieldsProvider>
  );
}

describe('wizard field state', () => {
  it('shares values and errors between the screen and its steps', () => {
    let latest: ReturnType<typeof useFieldState<'email' | 'password'>> | undefined;
    const screen = render(<Screen onFields={(fields) => (latest = fields as never)} />);

    expect(screen.getByTestId('email').props.children).toBe('');

    act(() => latest?.setError('email', 'Invalid email'));
    expect(screen.getByTestId('error').props.children).toBe('Invalid email');

    fireEvent.press(screen.getByText('change'));
    expect(screen.getByTestId('email').props.children).toBe('a@b.c');
    // typing clears the field's error
    expect(screen.getByTestId('error').props.children).toBe('none');
    expect(latest?.values).toEqual({ email: 'a@b.c', password: '' });
    screen.unmount();
  });

  it('fails loudly when a step is rendered outside its wizard', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Step />)).toThrow('only available inside their wizard');
    spy.mockRestore();
  });
});
