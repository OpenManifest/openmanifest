import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import FormColumn from '../FormColumn';
import { hostsOfType } from 'app/test-utils/hosts';

describe('FormColumn', () => {
  it('renders its children inside a scroll view', async () => {
    const screen = await render(
      <FormColumn testID="column">
        <Text>First field</Text>
        <Text>Second field</Text>
      </FormColumn>
    );

    expect(hostsOfType(screen.container, 'RCTScrollView')).toHaveLength(1);
    expect(screen.getByText('First field')).toBeTruthy();
    expect(screen.getByText('Second field')).toBeTruthy();
  });

  it('keeps taps working while the keyboard is open', async () => {
    const screen = await render(
      <FormColumn>
        <Text>Field</Text>
      </FormColumn>
    );

    expect(hostsOfType(screen.container, 'RCTScrollView')[0].props.keyboardShouldPersistTaps).toBe(
      'handled'
    );
  });

  it('limits the content to 560 and centres it', async () => {
    const screen = await render(
      <FormColumn contentContainerStyle={{ paddingTop: 8 }}>
        <Text>Field</Text>
      </FormColumn>
    );

    const content = StyleSheet.flatten(
      hostsOfType(screen.container, 'RCTScrollView')[0].props.contentContainerStyle
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
