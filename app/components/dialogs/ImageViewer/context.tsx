import * as React from 'react';
import noop from 'lodash/noop';
import ImageViewer from './ImageViewer';

type ImageViewerContextValue = {
  /** The image being shown, if any */
  image: string | null;
  open(image: string): void;
  close(): void;
};

const ImageViewerContext = React.createContext<ImageViewerContextValue>({
  image: null,
  open: noop,
  close: noop,
});

/** Shows one full-screen image at a time; `useImageViewer().open(uri)` from anywhere below the provider. */
export function ImageViewerProvider(props: React.PropsWithChildren<object>) {
  const [image, setImage] = React.useState<string | null>(null);
  const close = React.useCallback(() => setImage(null), []);

  const value = React.useMemo(() => ({ image, open: setImage, close }), [image, close]);

  return (
    <ImageViewerContext.Provider value={value}>
      {props.children}
      <ImageViewer />
    </ImageViewerContext.Provider>
  );
}

export function useImageViewer() {
  return React.useContext(ImageViewerContext);
}
