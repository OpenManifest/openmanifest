import * as React from 'react';
import MuiMenu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { View, TouchableOpacity } from 'react-native';
import { ListItemAvatar, ListItemIcon, ListItemText } from '@mui/material';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import UserAvatar from '../UserAvatar.web.old';

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
  const { title, bold, onPress, avatar, icon, testID } = props;
  return (
    <MuiMenuItem
      style={{ fontWeight: bold ? 'bold' : undefined }}
      onClick={onPress}
      data-testid={testID}
    >
      {!icon || avatar ? null : (
        <ListItemIcon>
          {typeof icon === 'string' ? <MaterialCommunityIcons icon={icon} /> : icon}
        </ListItemIcon>
      )}
      {!avatar ? null : (
        <ListItemAvatar>
          <UserAvatar name={avatar.name} image={avatar?.image} size={32} />
        </ListItemAvatar>
      )}
      <ListItemText>{title}</ListItemText>
    </MuiMenuItem>
  );
}

export default function Menu(props: IPopoverMenuProps) {
  const { open, setOpen, anchor, children } = props;
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const onClick = React.useCallback(
    (event) => {
      setOpen(true);
      console.log({ event });
      setAnchorEl(event.currentTarget);
    },
    [setOpen]
  );
  const onClose = React.useCallback(() => {
    setAnchorEl(null);
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      <TouchableOpacity onPress={onClick}>
        <View pointerEvents="none">{anchor}</View>
      </TouchableOpacity>
      <MuiMenu
        {...{ anchorEl, onClose, open }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {children}
      </MuiMenu>
    </>
  );
}
