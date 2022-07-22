import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DropzoneProvider } from 'app/api/crud/useDropzone';
import React from 'react';
import { useAppSelector } from './state';

export default function EntrypointWrapper(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const { currentDropzoneId } = useAppSelector((root) => root?.global);
  return (
    <DropzoneProvider dropzoneId={currentDropzoneId || undefined}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </DropzoneProvider>
  );
}
