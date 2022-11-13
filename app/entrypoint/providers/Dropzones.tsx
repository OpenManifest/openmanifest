import React from 'react';
import { DropzonesProvider } from 'app/api/crud';
import { ManifestContextProvider, DropzoneContextProvider } from 'app/providers';
import { useAppSelector } from 'app/state';

export default function Provider(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const { currentDropzoneId } = useAppSelector((root) => root?.global);
  return (
    <DropzonesProvider>
      <DropzoneContextProvider dropzoneId={currentDropzoneId?.toString() || undefined}>
        <ManifestContextProvider dropzone={currentDropzoneId?.toString() || undefined}>
          {children}
        </ManifestContextProvider>
      </DropzoneContextProvider>
    </DropzonesProvider>
  );
}
