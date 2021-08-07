import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import color from 'color';
import { Permission } from '../api/schema.d';

export interface IBadgeProps {
  disabled?: boolean;
  selected?: boolean;
  onPress?(): void;
  type:
    | Permission.ActAsDzso
    | Permission.ActAsGca
    | Permission.ActAsLoadMaster
    | Permission.ActAsPilot
    | Permission.ActAsRigInspector;
}

function Badge(props: IBadgeProps) {
  const { type, selected, disabled, onPress } = props;
  const iconName = {
    actAsDZSO: 'shield-cross',
    actAsGCA: 'radio-handheld',
    actAsLoadMaster: 'shield-account',
    actAsPilot: 'shield-airplane',
    actAsRigInspector: 'shield-search',
  }[type];

  const label = {
    actAsDZSO: 'DZSO',
    actAsGCA: 'GCA',
    actAsLoadMaster: 'Load Master',
    actAsPilot: 'Pilot',
    actAsRigInspector: 'Rig Inspector',
  }[type];

  const theme = useTheme();
  const primaryLight = color(theme.colors.primary).lighten(0.6).hex();
  const primaryDark = color(theme.colors.primary).darken(0.3).hex();
  return (
    <Chip
      mode={selected ? 'outlined' : 'flat'}
      style={[
        styles.chip,
        { borderColor: primaryDark },
        selected ? undefined : { opacity: 0.5 },
      ].filter(Boolean)}
      disabled={disabled}
      onPress={() => onPress?.()}
    >
      <View style={styles.innerChip}>
        <View style={{ marginRight: 8 }}>
          <MaterialCommunityIcons
            name={selected ? 'check' : iconName}
            color={primaryDark}
            size={18}
          />
        </View>
        <Text style={{ color: primaryDark }}>{label}</Text>
      </View>
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 24,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: 'white',
    width: 'auto',
  },
  innerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
});
export default Badge;
