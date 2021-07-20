import { useRoute } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Paragraph, TouchableRipple } from 'react-native-paper';


import { useAppDispatch, useAppSelector } from '../../../../redux';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

interface IIconInfoRow {
  icon: IconSource;
  label: string;
  iconColor?: string;
  onPress?(): void;
}
export default function IconInfoRow(props: IIconInfoRow) {
  const { label, icon, iconColor, onPress } = props;

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
        <List.Icon
          icon={icon}
          size={16}
          style={styles.icon}
          color={iconColor}
        />
        <Paragraph style={styles.label}>
          {label}
        </Paragraph>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  label: {
    color: "#999999"
  },
  icon: {
    height: 16,
    width: 16,
    marginHorizontal: 12,
    marginVertical: 16
  }
});
