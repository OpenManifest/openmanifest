import * as React from 'react';
import ImageView from 'react-native-image-viewing';
import { useImageViewer } from './context';

export default function ImageViewer() {
  const { image, close } = useImageViewer();

  return (
    <ImageView
      images={image ? [{ uri: image, cache: 'default' }] : []}
      imageIndex={0}
      visible={!!image}
      onRequestClose={close}
    />
  );
}
