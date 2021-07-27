import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return <View style={StyleSheet.absoluteFill}>{children}</View>;
}
