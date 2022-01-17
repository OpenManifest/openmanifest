import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAppSelector } from 'app/state';

function GradientText(props: TextProps & { children: React.ReactText }) {
  const { style } = props;
  const palette = useAppSelector((state) => state.global.palette);
  return (
    <Text {...props} style={style}>
      <span
        {...props}
        style={{
          opacity: 1,
          background: `linear-gradient(45deg, ${palette.primary.dark}, ${palette.primary.main})`,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore This is ok in web
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        }}
      />
    </Text>
  );
}

export default GradientText;
