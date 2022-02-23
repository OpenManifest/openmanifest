import * as React from 'react';
import { StyleSheet } from 'react-native';
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
      titleStyle={{ fontWeight: bold ? 'bold' : undefined }}
      {...{ title, onPress, testID, icon }}
      {...(!avatar
        ? {}
        : {
            title: (
              <>
                <UserAvatar {...avatar} />
                <Text style={styles.menuItemTitle}>{title}</Text>
              </>
            ),
          })}
    />
  );
}
export default function Menu(props: IPopoverMenuProps) {
  const { open, setOpen, anchor, children } = props;

  return <PaperMenu onDismiss={() => setOpen(false)} visible={open} {...{ anchor, children }} />;
}

const styles = StyleSheet.create({
  menuItemTitle: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
});
