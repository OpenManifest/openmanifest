import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import FloatingActionArea from '../FloatingActionArea';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 24, bottom: 34, left: 0, right: 12 }),
}));

describe('FloatingActionArea', () => {
  it('renders its children', () => {
    const screen = render(
      <FloatingActionArea testID="fabs">
        <Text>Add</Text>
      </FloatingActionArea>
    );

    expect(screen.getByText('Add')).toBeTruthy();
  });

  it('floats above the bottom inset and beside the right inset', () => {
    const screen = render(
      <FloatingActionArea testID="fabs">
        <Text>Add</Text>
      </FloatingActionArea>
    );

    expect(StyleSheet.flatten(screen.getByTestId('fabs').props.style)).toMatchObject({
      position: 'absolute',
      bottom: 0,
      right: 0,
      paddingBottom: 34 + 16,
      paddingRight: 12 + 16,
    });
  });

  it('skips the bottom inset inside a tab navigator, whose tab bar covers it', () => {
    const screen = render(
      <BottomTabBarHeightContext.Provider value={83}>
        <FloatingActionArea testID="fabs">
          <Text>Add</Text>
        </FloatingActionArea>
      </BottomTabBarHeightContext.Provider>
    );

    expect(StyleSheet.flatten(screen.getByTestId('fabs').props.style)).toMatchObject({
      paddingBottom: 16,
      paddingRight: 12 + 16,
    });
  });

  it('lets touches through to the content below', () => {
    const screen = render(
      <FloatingActionArea testID="fabs">
        <Text>Add</Text>
      </FloatingActionArea>
    );

    expect(screen.getByTestId('fabs').props.pointerEvents).toBe('box-none');
  });
});
