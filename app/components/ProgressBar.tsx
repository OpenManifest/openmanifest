import * as React from 'react';
import { View } from 'react-native';
import { ProgressBar as PaperProgressBar } from 'react-native-paper';

type Props = React.ComponentProps<typeof PaperProgressBar>;

/**
 * react-native-paper 5 renders its root with `height: '100%'` on web, so in a column flex parent the bar grows to the
 * height of the screen and pushes everything below it out of view. Wrapping it in a 4 px box restores the 4 px bar.
 */
export default function ProgressBar(props: Props) {
  return (
    <View style={{ height: 4 }}>
      <PaperProgressBar {...props} />
    </View>
  );
}
