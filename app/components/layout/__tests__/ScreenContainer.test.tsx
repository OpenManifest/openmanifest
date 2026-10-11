import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '../../../__mocks__/render';
import ScreenContainer from '../ScreenContainer';

describe('ScreenContainer', () => {
  it('fills the screen with the theme background', () => {
    const screen = render(
      <ScreenContainer testID="screen">
        <Text>Content</Text>
      </ScreenContainer>,
      { graphql: [] }
    );

    const style = StyleSheet.flatten(screen.getByTestId('screen').props.style);
    expect(style.flex).toBe(1);
    expect(style.backgroundColor).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
    screen.unmount();
  });
});
