import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { VehicleEssentialsFragment } from 'app/api/operations';
import { useVehiclesQuery } from 'app/api/reflection';
import { LoadVehicleRole } from 'app/api/schema.d';
import { useOperatorContext } from 'app/providers/operator/context';
import useTerms from 'app/i18n/useTerms';
import { IconButton, ListRow, Row, Stack, Subheader, Text } from 'app/ui';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

export type VehicleRole = { vehicle: VehicleEssentialsFragment; role: LoadVehicleRole };

interface IVehicleListProps {
  value?: VehicleRole[] | null;
  error?: string | null;
  onChange(rows: VehicleRole[]): void;
}

/**
 * The vehicles of a load with several (operators with the multi_vehicle module): which carry participants and which
 * support the load (a tug, a chase vehicle). The first vehicle of the operator starts as the one that carries.
 */
function VehicleList({ value, error, onChange }: IVehicleListProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const { operator: currentOperator } = useOperatorContext();
  const { data } = useVehiclesQuery({
    variables: { operatorId: currentOperator?.operator?.id?.toString() as string },
  });
  const rows = React.useMemo(() => value ?? [], [value]);
  const vehicles = React.useMemo(() => data?.vehicles ?? [], [data?.vehicles]);

  // The field subscribes to the form after its children have run their effects, so a value set by the first effect of a
  // field would be missed: the list is started on the render after that
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // The list is never empty once it has one (the last vehicle that carries cannot be removed), so an empty list is one the
  // form has just reset
  React.useEffect(() => {
    if (mounted && !rows.length && vehicles[0]) {
      onChange([{ vehicle: vehicles[0], role: LoadVehicleRole.Carrying }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, vehicles, rows.length]);

  const carrying = rows.filter(({ role }) => role === LoadVehicleRole.Carrying).length;
  const toggle = (index: number) =>
    onChange(
      rows.map((row, at) =>
        at === index
          ? {
              ...row,
              role:
                row.role === LoadVehicleRole.Carrying
                  ? LoadVehicleRole.Support
                  : LoadVehicleRole.Carrying,
            }
          : row
      )
    );

  return (
    <Stack gap="sm" testID="load-vehicles">
      <Subheader>{term('vehicle', 2)}</Subheader>
      {rows.map(({ vehicle, role }, index) => {
        const name = vehicle.name ?? vehicle.registration ?? vehicle.id;
        const carries = role === LoadVehicleRole.Carrying;
        return (
          <ListRow
            key={vehicle.id}
            title={name}
            supporting={
              carries
                ? t('forms.load.vehicleCarries', { seats: vehicle.capacity })
                : t('forms.load.vehicleSupports')
            }
            trailing={
              <Row gap="xs">
                <IconButton
                  icon={carries ? 'seat-passenger' : 'account-off-outline'}
                  aria-label={
                    carries
                      ? t('forms.load.makeSupport', { name })
                      : t('forms.load.makeCarry', { name })
                  }
                  disabled={carries && carrying === 1}
                  onPress={() => toggle(index)}
                />
                <IconButton
                  icon="close"
                  aria-label={t('forms.load.removeVehicle', { name })}
                  disabled={carries && carrying === 1}
                  onPress={() => onChange(rows.filter((_, at) => at !== index))}
                />
              </Row>
            }
          />
        );
      })}
      {error ? (
        <Text variant="caption" tone="blocked" role="alert">
          {error}
        </Text>
      ) : null}
      <Select<string>
        label={t('forms.load.addVehicle', { vehicle: term('vehicle').toLowerCase() })}
        testID="load-vehicle-add"
        value={null}
        options={vehicles
          .filter((vehicle) => !rows.some((row) => row.vehicle.id === vehicle.id))
          .map((vehicle) => ({ label: vehicle.name ?? vehicle.id, value: vehicle.id }))}
        onChange={(id) => {
          const vehicle = vehicles.find((candidate) => candidate.id === id);
          if (vehicle) onChange([...rows, { vehicle, role: LoadVehicleRole.Carrying }]);
        }}
      />
    </Stack>
  );
}

export const VehicleListField = withHookForm(VehicleList);

export default VehicleList;
