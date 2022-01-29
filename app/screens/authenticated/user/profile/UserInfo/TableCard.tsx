import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, List } from 'react-native-paper';

import { useAppSelector } from 'app/state';

interface ITableCard {
  children: React.ReactNode;
  title: string;
  buttonIcon?: string;
  onPressButton?(): void;
}
export default function TableCard(props: ITableCard) {
  const state = useAppSelector((root) => root.global);
  const { title, children, buttonIcon, onPressButton } = props;

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <List.Subheader style={styles.title}>{title}</List.Subheader>
        {buttonIcon && (
          <IconButton
            icon={buttonIcon}
            onPress={() => (!onPressButton ? null : onPressButton())}
            color={state.theme.colors.primary}
          />
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { flexGrow: 1 },
  card: {
    marginVertical: 8,
    width: '100%',
  },
});
