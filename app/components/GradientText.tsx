import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from 'app/state';

function GradientText(props: TextProps & { children: React.ReactText }) {
  const { style } = props;
  const palette = useAppSelector((state) => state.global.palette);
  return (
    <MaskedView maskElement={<Text {...props} />}>
      <LinearGradient
        colors={[palette.primary.dark, palette.primary.main]}
        start={[0, 1]}
        end={[1, 0]}
      >
        <Text {...props} style={[style, { opacity: 0 }]} />
      </LinearGradient>
    </MaskedView>
  );
}

export default GradientText;
