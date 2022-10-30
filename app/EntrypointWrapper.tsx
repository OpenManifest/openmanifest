import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DropzoneProvider } from 'app/api/crud/useDropzone';
import React from 'react';
import { DropzonesProvider } from './api/crud';
import { useAppSelector } from './state';

export default function EntrypointWrapper(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const { currentDropzoneId } = useAppSelector((root) => root?.global);
  return (
    <DropzonesProvider>
      <DropzoneProvider dropzoneId={currentDropzoneId || undefined}>
        <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
      </DropzoneProvider>
    </DropzonesProvider>
  );
}
