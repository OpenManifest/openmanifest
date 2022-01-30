import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Paragraph, Title, useTheme } from 'react-native-paper';
import { View } from './Themed';

interface INoResults {
  title: string;
  subtitle: string;
  color?: string;
}
export default function NoResults({ title, color, subtitle }: INoResults) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <Title style={{ color: color || theme.colors.onSurface }}>{title}</Title>
      <Paragraph style={{ color: color || theme.colors.onSurface, textAlign: 'center' }}>{subtitle}</Paragraph>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: 'flex',
    backgroundColor: 'transparent',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    height: '100%',
  },
});
