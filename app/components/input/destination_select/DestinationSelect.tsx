import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { DestinationKind } from 'app/api/schema.d';
import { useDestinations } from 'app/api/crud';
import useTerms from 'app/i18n/useTerms';
import { compactAltitude } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IDestinationSelectProps {
  /** The id of the selected destination */
  value?: string | null;
  label?: string;
  error?: string | null;
  helperText?: string;
  /** Only the destinations of these kinds */
  kinds?: DestinationKind[];
  /** Offers "None" as a choice; the value is then `null` */
  allowNone?: boolean;
  /** Ids to leave out (the ones a load already visits) */
  exclude?: string[];
  testID?: string;
  onChange(id: string | null): void;
}

const NONE = '';

/** One of the operator's destinations: an altitude, a site, a route or a section. Replaces the old altitude select. */
function DestinationSelect({
  value,
  label,
  error,
  helperText,
  kinds,
  allowNone = false,
  exclude,
  testID,
  onChange,
}: IDestinationSelectProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const { destinations } = useDestinations();
  const units = useOperatorFormat((state) => state.units);

  const options = React.useMemo(() => {
    const list = destinations
      .filter((destination) => !kinds || kinds.includes(destination.kind))
      .filter((destination) => !exclude?.includes(destination.id))
      .map((destination) => ({
        label:
          destination.kind === 'altitude' && destination.altitudeM != null
            ? `${destination.name} (${compactAltitude(destination.altitudeM, units)})`
            : destination.name,
        value: destination.id,
        icon: destination.kind === 'altitude' ? ('airplane-takeoff' as const) : undefined,
      }));
    return allowNone
      ? [{ label: t('forms.destination.none'), value: NONE, icon: undefined }, ...list]
      : list;
  }, [destinations, kinds, exclude, allowNone, t, units]);

  return (
    <Select<string>
      label={label ?? term('destination')}
      {...{ error, helperText, options, testID }}
      value={value ?? (allowNone ? NONE : null)}
      onChange={(id) => onChange(id === NONE ? null : id)}
    />
  );
}

export const DestinationSelectField = withHookForm(DestinationSelect);

export default DestinationSelect;
