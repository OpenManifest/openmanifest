import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { DropzoneProvider } from 'app/api/crud/useDropzone';
import { useAppSelector } from './state';

export default function EntrypointWrapper(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const { currentDropzoneId } = useAppSelector((root) => root?.global);
  return (
    <DropzoneProvider dropzoneId={currentDropzoneId || undefined}>
      <View style={StyleSheet.absoluteFill}>{children}</View>
    </DropzoneProvider>
  );
}
