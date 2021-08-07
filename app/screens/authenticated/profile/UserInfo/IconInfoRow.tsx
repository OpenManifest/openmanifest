import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Paragraph, TouchableRipple, useTheme } from 'react-native-paper';

import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

interface IIconInfoRow {
  icon: IconSource;
  label: string;
  iconColor?: string;
  variant?: 'dark' | 'light';
  onPress?(): void;
}
export default function IconInfoRow(props: IIconInfoRow) {
  const { label, variant, icon, iconColor, onPress } = props;

  const theme = useTheme();

  const color = variant === 'light' ? theme.colors.surface : theme.colors.onSurface;
  return (
    <TouchableRipple
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
      disabled={!onPress}
    >
      <View style={styles.container}>
        <List.Icon icon={icon} style={styles.icon} color={color} />
        <Paragraph style={[styles.label, { color }]}>{label}</Paragraph>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#999999',
  },
  icon: {
    height: 16,
    width: 16,
    marginHorizontal: 12,
    marginVertical: 16,
  },
});
