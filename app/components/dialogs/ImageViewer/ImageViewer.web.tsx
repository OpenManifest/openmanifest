import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import { actions, useAppDispatch, useAppSelector } from '../../../state';

export default function ImageViewer() {
  const { open, image } = useAppSelector((root) => root.imageViewer);
  const dispatch = useAppDispatch();

  console.log('Showing image', image);
  return !open || !image ? null : (
    <Lightbox mainSrc={image} onCloseRequest={() => dispatch(actions.imageViewer.close())} />
  );
}
