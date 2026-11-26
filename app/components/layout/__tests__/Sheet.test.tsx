import * as React from 'react';
import { Text, View } from 'react-native';
import { act } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';
import { hostsWhere } from 'app/test-utils/hosts';
import { render } from '../../../__mocks__/render';
import TextField from '../../input/text/TextField';
import Sheet from '../Sheet';

// The jest mock of BottomSheetTextInput marks its host element (jest.setup.ts)
const isSheetInput = (instance: TestInstance) => instance.props['data-bottom-sheet-input'] === true;

describe('Sheet', () => {
  it('renders its content when open', async () => {
    const screen = await render(
      <Sheet open onClose={jest.fn()} testID="sheet">
        <Text>Sheet content</Text>
      </Sheet>,
      { graphql: [] }
    );
    await act(async () => {});

    expect(screen.getByText('Sheet content')).toBeTruthy();
    await screen.unmount();
  });

  it('gives the text fields inside it a BottomSheetTextInput', async () => {
    const screen = await render(
      <Sheet open onClose={jest.fn()} testID="sheet">
        <TextField label="Name" value="" onChangeText={jest.fn()} />
      </Sheet>,
      { graphql: [] }
    );
    await act(async () => {});

    // The manifest context mounts closed dialogs of its own, so look inside this sheet only
    expect(hostsWhere(screen.getByTestId('sheet'), isSheetInput).length).toBeGreaterThan(0);
    await screen.unmount();
  });

  it('leaves text fields outside of a sheet with the regular input', async () => {
    const screen = await render(
      <View testID="outside">
        <TextField label="Name" value="" onChangeText={jest.fn()} />
      </View>,
      { graphql: [] }
    );

    expect(hostsWhere(screen.getByTestId('outside'), isSheetInput)).toHaveLength(0);
    await screen.unmount();
  });
});
