import * as React from 'react';
import ImageView from 'react-native-image-viewing';
import { actions, useAppDispatch, useAppSelector } from '../../../state';

export default function ImageViewer() {
  const { open, image } = useAppSelector((root) => root.imageViewer);
  const dispatch = useAppDispatch();

  console.log('Showing image', image);
  return (
    <ImageView
      images={image ? [{ uri: image, cache: 'default' }] : []}
      imageIndex={0}
      visible={open}
      onRequestClose={() => dispatch(actions.imageViewer.close())}
    />
  );
}
