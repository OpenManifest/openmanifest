import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider as MaterialDivider, Text, useTheme } from 'react-native-paper';

export default function Divider(props: { children: React.ReactText }) {
  const { children } = props;
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <MaterialDivider style={[styles.divider, { backgroundColor: theme.colors.onSurface }]} />
      <Text style={styles.text}>{children}</Text>
      <MaterialDivider style={[styles.divider, { backgroundColor: theme.colors.onSurface }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  divider: { flex: 2 / 5, backgroundColor: 'white' },
  text: { flex: 1 / 5, textAlign: 'center' },
});
