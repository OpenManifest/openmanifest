import * as React from 'react';
import { Avatar } from 'react-native-paper';

import first from 'lodash/first';

type AvatarProps = typeof Avatar.Image extends React.ComponentType<infer P> ? P : never;

interface IUserAvatarProps extends Omit<AvatarProps, 'source'> {
  source?: AvatarProps['source'];
  image?: string | null;
  name?: string | null;
}
export default function UserAvatar(props: IUserAvatarProps) {
  const { name, image, source: _, size, ...rest } = props;
  const initals = name
    ?.split(/\s/g)
    .map((n) => first(n))
    .join('');

  return !image ? (
    <Avatar.Text
      label={initals || ''}
      {...rest}
      style={{ alignSelf: 'center' }}
      size={size || 32}
    />
  ) : (
    <Avatar.Image
      source={{ uri: image }}
      style={{ alignSelf: 'center' }}
      size={size || 32}
      {...rest}
    />
  );
}
