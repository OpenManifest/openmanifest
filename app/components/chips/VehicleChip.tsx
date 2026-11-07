import { VehicleEssentialsFragment } from 'app/api/operations';
import { useTranslation } from 'react-i18next';
import { truncate } from 'lodash';
import * as React from 'react';
import { useSession } from 'app/state';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useVehiclesQuery } from '../../api/reflection';
import { Permission } from '../../api/schema.d';
import useRestriction from '../../hooks/useRestriction';
import Select, { ISelectOption } from '../input/select/Select';
import Chip from './Chip';
import { useVehicleGlyphs } from 'app/features/board/VehicleIcon';

interface IVehicleChipSelect {
  value?: VehicleEssentialsFragment | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;

  onSelect(dzUser: VehicleEssentialsFragment): void;
}

export default function VehicleChip(props: IVehicleChipSelect) {
  const { small, color: assignedColor, backgroundColor, value, onSelect } = props;
  const theme = useTheme();
  const { t } = useTranslation(['common', 'terms']);
  const color = assignedColor || theme.colors.onSurface;
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  const { data } = useVehiclesQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
    },
  });
  const allowed = useRestriction(Permission.UpdateLoad);
  const glyph = useVehicleGlyphs(value?.kind).vehicle;

  const options = React.useMemo(
    () =>
      data?.vehicles?.map((node) => ({
        label: node?.name || '',
        value: node as VehicleEssentialsFragment,
      })) || [],
    [data?.vehicles]
  );

  const selected = React.useMemo(
    () => data?.vehicles?.find((node) => node?.id === value?.id),
    [data?.vehicles, value?.id]
  );

  const renderAnchor: React.FC<{
    item?: ISelectOption<VehicleEssentialsFragment>;
    openMenu(): void;
  }> = React.useCallback(
    ({ item, openMenu }) => (
      <Chip
        {...{ backgroundColor, small, color, onPress: openMenu }}
        style={{ maxWidth: 100 }}
        icon={glyph}
      >
        {truncate(
          item?.label ||
            t('common:legacy.noVehicle', { vehicle: t('terms:vehicle', { count: 1 }) }),
          { length: 12 }
        )}
      </Chip>
    ),
    [backgroundColor, color, glyph, small, t]
  );

  return !allowed ? (
    <Chip {...{ backgroundColor, small, color }} style={{ maxWidth: 100 }} icon={glyph}>
      {value?.name || t('common:legacy.noVehicle', { vehicle: t('terms:vehicle', { count: 1 }) })}
    </Chip>
  ) : (
    <View style={{ maxWidth: 100 }}>
      <Select<VehicleEssentialsFragment>
        value={selected}
        options={options}
        renderAnchor={renderAnchor}
        onChange={onSelect}
      />
    </View>
  );
}
