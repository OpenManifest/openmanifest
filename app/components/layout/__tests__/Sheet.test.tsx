import * as React from 'react';
import { Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { act, within } from '@testing-library/react-native';
import { render } from '../../../__mocks__/render';
import TextField from '../../input/text/TextField';
import Sheet from '../Sheet';

describe('Sheet', () => {
  it('renders its content when open', async () => {
    const screen = render(
      <Sheet open onClose={jest.fn()} testID="sheet">
        <Text>Sheet content</Text>
      </Sheet>,
      { graphql: [] }
    );
    await act(async () => {});

    expect(screen.getByText('Sheet content')).toBeTruthy();
    screen.unmount();
  });

  it('gives the text fields inside it a BottomSheetTextInput', async () => {
    const screen = render(
      <Sheet open onClose={jest.fn()} testID="sheet">
        <TextField label="Name" value="" onChangeText={jest.fn()} />
      </Sheet>,
      { graphql: [] }
    );
    await act(async () => {});

    // The manifest context mounts closed dialogs of its own, so look inside this sheet only
    expect(
      within(screen.getByTestId('sheet')).UNSAFE_getAllByType(BottomSheetTextInput).length
    ).toBeGreaterThan(0);
    screen.unmount();
  });

  it('leaves text fields outside of a sheet with the regular input', () => {
    const screen = render(
      <View testID="outside">
        <TextField label="Name" value="" onChangeText={jest.fn()} />
      </View>,
      { graphql: [] }
    );

    const outside = within(screen.getByTestId('outside'));
    expect(outside.UNSAFE_queryAllByType(BottomSheetTextInput)).toHaveLength(0);
    screen.unmount();
  });
});
