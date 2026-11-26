import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Avatar, type AvatarSize } from 'app/ui';

interface IUserAvatarProps {
  image?: string | null;
  name?: string | null;
  /** In dp, as the older screens give it: the nearest size of the design system is used */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** The nearest avatar size of the design system to a size in dp */
export function avatarSizeOf(size = 32): AvatarSize {
  if (size >= 52) return 'lg';
  if (size >= 38) return 'md';
  return 'sm';
}

/** The avatar of the older screens (a size in dp): `Avatar` from `app/ui` in the nearest of its sizes */
export default function UserAvatar({ image, name, size, style }: IUserAvatarProps) {
  return (
    <View style={[{ alignSelf: 'center' }, style]}>
      <Avatar name={name || ''} imageUri={image} size={avatarSizeOf(size)} />
    </View>
  );
}
