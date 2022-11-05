import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export default function EntrypointWrapper(props: React.PropsWithChildren<object>) {
  const { children } = props;
  return <View style={StyleSheet.absoluteFill}>{children}</View>;
}
