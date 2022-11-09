import { DropzoneProvider } from 'app/api/crud/useDropzone';
import React from 'react';
import { DropzonesProvider } from 'app/api/crud';
import { ManifestProvider } from 'app/api/crud/useManifest/useManifest';
import { useAppSelector } from 'app/state';

export default function Provider(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const { currentDropzoneId } = useAppSelector((root) => root?.global);
  return (
    <DropzonesProvider>
      <DropzoneProvider dropzoneId={currentDropzoneId?.toString() || undefined}>
        <ManifestProvider dropzone={currentDropzoneId?.toString() || undefined}>
          {children}
        </ManifestProvider>
      </DropzoneProvider>
    </DropzonesProvider>
  );
}
