import * as React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import FormColumn from '../FormColumn';

describe('FormColumn', () => {
  it('renders its children inside a scroll view', () => {
    const screen = render(
      <FormColumn testID="column">
        <Text>First field</Text>
        <Text>Second field</Text>
      </FormColumn>
    );

    const scroll = screen.UNSAFE_getByType(ScrollView);
    expect(scroll).toBeTruthy();
    expect(screen.getByText('First field')).toBeTruthy();
    expect(screen.getByText('Second field')).toBeTruthy();
  });

  it('keeps taps working while the keyboard is open', () => {
    const screen = render(
      <FormColumn>
        <Text>Field</Text>
      </FormColumn>
    );

    expect(screen.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
  });

  it('limits the content to 560 and centres it', () => {
    const screen = render(
      <FormColumn contentContainerStyle={{ paddingTop: 8 }}>
        <Text>Field</Text>
      </FormColumn>
    );

    const content = StyleSheet.flatten(
      screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle
    );
    expect(content).toMatchObject({
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
    });
  });
});
