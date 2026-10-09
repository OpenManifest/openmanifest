import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAppTheme } from 'app/theme';

function GradientText(props: TextProps & { children: string | number }) {
  const { children, style, numberOfLines } = props;
  const { palette } = useAppTheme();
  return (
    <Text numberOfLines={numberOfLines} style={style}>
      <span
        style={{
          opacity: 1,
          // Not the `background` shorthand: it resets `background-clip` whenever the colours change, which turned the
          // text into a solid block after the dropzone's theme loaded.
          backgroundImage: `linear-gradient(45deg, ${palette.primary.dark}, ${palette.primary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </span>
    </Text>
  );
}

export default GradientText;
