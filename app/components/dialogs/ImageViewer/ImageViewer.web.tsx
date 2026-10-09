import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import { useImageViewer } from './context';

export default function ImageViewer() {
  const { image, close } = useImageViewer();

  return !image ? null : <Lightbox mainSrc={image} onCloseRequest={close} />;
}
