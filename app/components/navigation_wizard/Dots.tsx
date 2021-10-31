import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import usePalette from 'app/hooks/usePalette';
import { useAppSelector } from 'app/state';

interface IDotsProps {
  count: number;
  index: number;
}
export default function Dots(props: IDotsProps) {
  const { count, index } = props;
  const palette = useAppSelector((state) => state.global.palette);

  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <View
          style={[
            idx === index ? styles.activeDot : styles.inactiveDot,
            { backgroundColor: idx === index ? palette.primary.main : palette.primary.light },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  inactiveDot: {
    width: 6,
    height: 6,
    marginTop: 1,
    marginLeft: 2,
    marginRight: 2,
    borderRadius: 3,
  },
  activeDot: { width: 8, height: 8, marginLeft: 2, marginRight: 2, borderRadius: 4 },
});
