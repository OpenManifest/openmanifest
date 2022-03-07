import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu as PaperMenu, Text } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import UserAvatar from '../UserAvatar';

interface IPopoverMenuProps {
  open: boolean;
  anchor: React.ReactNode;
  children: React.ReactNode;
  setOpen(open: boolean): void;
}

interface IMenuItemProps {
  title?: string | null;
  testID?: string;
  bold?: boolean;
  icon?: IconSource;
  avatar?: { name: string; image?: string } | null;
  onPress(): void;
}
export function MenuItem(props: IMenuItemProps) {
  const { title, icon, bold, onPress, avatar, testID } = props;
  return (
    <PaperMenu.Item
      titleStyle={StyleSheet.flatten([
        {
          fontWeight: bold ? 'bold' : undefined,
        },
      ])}
      {...{ title, onPress, testID, icon }}
      {...(!avatar
        ? {}
        : {
            title: (
              <View style={styles.menuItemTitleContainer}>
                <UserAvatar {...avatar} />
                <Text style={styles.menuItemTitleText}>{title}</Text>
              </View>
            ),
          })}
    />
  );
}
export default function Menu(props: IPopoverMenuProps) {
  const { open: visible, setOpen, anchor, children } = props;

  const onDismiss = React.useCallback(() => setOpen(false), [setOpen]);
  return <PaperMenu {...{ anchor, children, onDismiss, visible }} />;
}

const styles = StyleSheet.create({
  menuItemTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  menuItemTitleText: {
    marginLeft: 16,
    fontSize: 16,
  },
});
