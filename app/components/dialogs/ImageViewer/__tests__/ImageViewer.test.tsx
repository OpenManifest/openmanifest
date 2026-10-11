import * as React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { ImageViewerProvider, useImageViewer } from '../context';

jest.mock('react-native-image-viewing', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ images, visible }: { images: { uri: string }[]; visible: boolean }) =>
      visible ? <MockText testID="viewer">{images[0]?.uri}</MockText> : null,
  };
});

function Controls() {
  const { open, close } = useImageViewer();
  return (
    <>
      <Text onPress={() => open('https://example.com/card.png')}>open</Text>
      <Text onPress={close}>close</Text>
    </>
  );
}

describe('ImageViewerProvider', () => {
  it('shows the image that was opened until it is closed', () => {
    const screen = render(
      <ImageViewerProvider>
        <Controls />
      </ImageViewerProvider>
    );

    expect(screen.queryByTestId('viewer')).toBeNull();

    fireEvent.press(screen.getByText('open'));
    expect(screen.getByTestId('viewer').props.children).toBe('https://example.com/card.png');

    fireEvent.press(screen.getByText('close'));
    expect(screen.queryByTestId('viewer')).toBeNull();
    screen.unmount();
  });
});
