import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAppTheme } from 'app/theme';

function GradientText(props: TextProps & { children: string | number }) {
  const { style } = props;
  const { palette } = useAppTheme();
  return (
    <Text {...props} style={style}>
      <span
        {...props}
        style={{
          opacity: 1,
          background: `linear-gradient(45deg, ${palette.primary.dark}, ${palette.primary.main})`,

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
