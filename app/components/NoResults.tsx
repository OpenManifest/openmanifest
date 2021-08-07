import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Paragraph, Title } from 'react-native-paper';
import { View } from './Themed';

interface INoResults {
  title: string;
  subtitle: string;
  color?: string;
}
export default function NoResults({ title, color, subtitle }: INoResults) {
  return (
    <View style={styles.empty}>
      <Title style={{ color }}>{title}</Title>
      <Paragraph style={{ color, textAlign: 'center' }}>{subtitle}</Paragraph>
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
