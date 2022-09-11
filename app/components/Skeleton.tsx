import * as React from 'react';
import { useTheme } from 'react-native-paper';
import SkeletonContent from '@03balogun/react-native-skeleton-content';
import Color from 'color';

type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : object;

const defaultColors = {
  boneColor: '#E1E9EE',
  highlightColor: '#F2F8FC',
};

export default function ThemedSkeleton(props: ExtractProps<typeof SkeletonContent>) {
  const theme = useTheme();
  const boneColor = theme.dark
    ? Color(defaultColors.boneColor).negate().rgb().toString()
    : defaultColors.boneColor;
  const highlightColor = theme.dark
    ? Color(defaultColors.highlightColor).negate().rgb().toString()
    : defaultColors.highlightColor;

  console.debug('Skeleton content', props);
  return <SkeletonContent {...{ boneColor, highlightColor }} {...props} />;
}
