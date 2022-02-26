import * as React from 'react';
import Avatar from '@mui/material/Avatar';

import first from 'lodash/first';

interface IUserAvatarProps {
  image?: string | null;
  name?: string | null;
  size?: number;
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export default function UserAvatar(props: IUserAvatarProps) {
  const { name, image, size } = props;
  const initials = name
    ?.split(/\s/g)
    .map((n) => first(n))
    .join('');

  return (
    <Avatar
      sx={{
        bgcolor: stringToColor(name || 'Dropzone User'),
      }}
      style={{ height: size, width: size, alignSelf: 'center', marginRight: 12 }}
      src={image || undefined}
    >
      {initials}
    </Avatar>
  );
}
