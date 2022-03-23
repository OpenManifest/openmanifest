import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Platform } from 'react-native';
import { Chip as MaterialChip, useTheme } from 'react-native-paper';

type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : object;

export type ChipProps = Omit<ExtractProps<typeof MaterialChip>, 'icon'> & {
  icon?: ExtractProps<typeof MaterialCommunityIcons>['name'];
} & {
  small?: boolean;
  color?: string;
  backgroundColor?: string;
};
export default function Chip(props: ChipProps) {
  const { small, icon, color: assignedColor, mode, style, backgroundColor, ...rest } = props;
  const theme = useTheme();
  const color = assignedColor || theme.colors.onSurface;

  const chipStyle: ChipProps['style'] = React.useMemo(
    () => ({
      marginHorizontal: 4,
      backgroundColor: mode !== 'flat' ? backgroundColor : undefined,
      height: small ? 25 : undefined,
      alignItems: 'center' as const,
      borderColor: mode !== 'flat' ? color || undefined : undefined,
    }),
    [backgroundColor, color, mode, small]
  );
  const iconStyles: ChipProps['style'] = React.useMemo(
    () => (Platform.OS === 'web' ? {} : { marginTop: 0, marginBottom: 3 }),
    []
  );

  return (
    <MaterialChip
      mode={mode || 'outlined'}
      selectedColor={color}
      style={[chipStyle, style]}
      icon={
        icon
          ? (iconProps) => <MaterialCommunityIcons name={icon} {...iconProps} style={iconStyles} />
          : undefined
      }
      textStyle={iconStyles}
      {...rest}
    />
  );
}
