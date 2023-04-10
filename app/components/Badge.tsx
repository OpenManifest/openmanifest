import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { useAppSelector } from '../state';
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
  const { palette } = useAppSelector((root) => root.global);
  const iconName = {
    [Permission.ActAsDzso]: 'shield-cross',
    [Permission.ActAsGca]: 'radio-handheld',
    [Permission.ActAsLoadMaster]: 'shield-account',
    [Permission.ActAsPilot]: 'account-tie-hat',
    [Permission.ActAsRigInspector]: 'shield-search'
  }[type];

  const label = {
    [Permission.ActAsDzso]: 'DZSO',
    [Permission.ActAsGca]: 'GCA',
    [Permission.ActAsLoadMaster]: 'Load Master',
    [Permission.ActAsPilot]: 'Pilot',
    [Permission.ActAsRigInspector]: 'Rig Inspector'
  }[type];

  return (
    <Chip
      mode={selected ? 'outlined' : 'flat'}
      style={[styles.chip, { borderColor: palette.primary.dark }, selected ? undefined : { opacity: 0.5 }].filter(
        Boolean
      )}
      disabled={disabled}
      onPress={() => onPress?.()}
    >
      <View style={styles.innerChip}>
        <View style={{ marginRight: 8 }}>
          <MaterialCommunityIcons
            // @ts-ignore
            name={selected ? 'check' : iconName}
            color={palette.primary.dark}
            size={18}
          />
        </View>
        <Text style={{ color: palette.primary.dark }}>{label}</Text>
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
    width: 'auto'
  },
  innerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30
  }
});
export default Badge;
