import React from 'react';
import { DropzonesProvider } from 'app/api/crud';
import { ManifestContextProvider, DropzoneContextProvider } from 'app/providers';
import { useSession } from 'app/state';

export default function Provider(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const currentDropzoneId = useSession((session) => session.currentDropzoneId);
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
