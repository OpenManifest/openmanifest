import * as React from 'react';
import { Animated, Platform, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Color from 'color';

export interface ICustomViewStyle extends ViewStyle {
  children?: ICustomViewStyle[];
  key?: number | string;
}

export interface ISkeletonContentProps {
  isLoading: boolean;
  layout?: ICustomViewStyle[];
  containerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const DEFAULT_BORDER_RADIUS = 4;
const PULSE_DURATION = 600;
const defaultColors = {
  boneColor: '#E1E9EE',
  highlightColor: '#F2F8FC',
};

/**
 * Grey placeholder blocks that pulse while content is loading. `layout` describes the blocks (a block can contain
 * `children` blocks); without a layout every child is replaced by a block with the child's own style. Renders the
 * children once `isLoading` is false.
 */
export default function SkeletonContent(props: ISkeletonContentProps) {
  const { isLoading, layout = [], containerStyle, children } = props;
  const theme = useTheme();
  const boneColor = theme.dark
    ? Color(defaultColors.boneColor).negate().rgb().toString()
    : defaultColors.boneColor;
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!isLoading) {
      return undefined;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_DURATION,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: PULSE_DURATION,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isLoading, pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] });

  const renderBones = (bones: ICustomViewStyle[], prefix = ''): React.ReactNode =>
    bones.map(({ children: nested, key, ...style }, index) => {
      const boneKey = key ?? `${prefix}bone_${index}`;
      if (nested?.length) {
        return (
          <View key={boneKey} style={style}>
            {renderBones(nested, `${boneKey}_`)}
          </View>
        );
      }
      return (
        <Animated.View
          key={boneKey}
          testID="skeleton-bone"
          style={[
            {
              borderRadius: DEFAULT_BORDER_RADIUS,
              backgroundColor: boneColor,
              overflow: 'hidden',
              opacity,
            },
            style,
          ]}
        />
      );
    });

  if (!isLoading) {
    return <View style={containerStyle}>{children}</View>;
  }

  const bones = layout.length
    ? renderBones(layout)
    : React.Children.map(children, (child, index) => {
        const style =
          (React.isValidElement(child) && (child.props as { style?: ViewStyle }).style) || {};
        return renderBones([{ key: index, ...(style as ViewStyle) }]);
      });

  return <View style={containerStyle}>{bones}</View>;
}
