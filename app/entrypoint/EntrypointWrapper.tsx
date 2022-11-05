import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React from 'react';

export default function EntrypointWrapper(props: React.PropsWithChildren<object>) {
  const { children } = props;
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
}
