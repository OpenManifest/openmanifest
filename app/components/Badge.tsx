import * as React from 'react';
import { Chip } from 'react-native-paper';
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

  return (
    <Chip
      mode={selected ? 'outlined' : 'flat'}
      icon={iconName}
      textStyle={{
        ...(selected ? {} : { color: 'white' }),
        fontSize: 12,
      }}
      style={[
        { marginHorizontal: 2, height: 25, alignItems: 'center' },
        selected ? undefined : { backgroundColor: 'transparent', borderColor: 'white' },
      ].filter(Boolean)}
      disabled={disabled}
      onPress={() => onPress?.()}
    >
      {label}
    </Chip>
  );
}

export default Badge;
