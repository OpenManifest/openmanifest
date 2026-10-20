import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import Text from '../Text';

export type SubheaderProps = {
  children: string;
  testID?: string;
};

/** The small heading over a group of fields or rows: the name of the group, in muted label type */
export default function Subheader({ children, testID }: SubheaderProps) {
  const { space } = useTheme();

  return (
    <View style={{ paddingVertical: space.sm }}>
      <Text variant="label" tone="muted" role="heading" aria-level={3} testID={testID}>
        {children}
      </Text>
    </View>
  );
}
