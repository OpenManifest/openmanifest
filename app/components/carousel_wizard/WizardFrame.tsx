import * as React from 'react';
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native';
import { useStyles, type Theme } from 'app/ui';
import ScreenContainer from '../layout/ScreenContainer';
import Dots from './Dots';

export interface IWizardFrameProps {
  /** Number of dots to show; none when omitted */
  dotCount?: number;
  dotIndex?: number;
  /** Receives the width of the wizard, which is the width of one page */
  children(pageWidth: number): React.ReactNode;
}

/** Safe-area aware container for the wizard pages: progress dots on top, the pages filling the rest */
export default function WizardFrame(props: IWizardFrameProps) {
  const { dotCount, dotIndex = 0, children } = props;
  const styles = useStyles(stylesFor);
  const [width, setWidth] = React.useState(0);
  const screen = useWindowDimensions();
  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <ScreenContainer testID="wizard">
      {dotCount === undefined ? null : (
        <View style={styles.dots}>
          <Dots count={dotCount} index={dotIndex} />
        </View>
      )}
      <View style={styles.pages} onLayout={onLayout}>
        {children(width || screen.width)}
      </View>
    </ScreenContainer>
  );
}

const stylesFor = (theme: Theme) => ({
  dots: {
    alignSelf: 'center' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: theme.space.lg,
    zIndex: 1100,
  },
  pages: {
    flex: 1,
  },
});
