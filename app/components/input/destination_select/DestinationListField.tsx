import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useDestinations } from 'app/api/crud';
import useTerms from 'app/i18n/useTerms';
import { formatDestination } from 'app/i18n/format';
import { IconButton, ListRow, Row, Stack, Subheader, Text } from 'app/ui';
import { withHookForm } from '../withHookForm';
import DestinationSelect from './DestinationSelect';

interface IDestinationListProps {
  /** The ids of the destinations, in the order the load visits them */
  value?: string[] | null;
  error?: string | null;
  onChange(ids: string[]): void;
}

/** The places a load visits (operators with per-load destinations): add them, put them in order, take them out */
function DestinationList({ value, error, onChange }: IDestinationListProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const { destinations } = useDestinations();
  const ids = value ?? [];
  const byId = React.useMemo(
    () => new Map(destinations.map((destination) => [destination.id, destination])),
    [destinations]
  );

  const move = (index: number, by: -1 | 1) => {
    const next = [...ids];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    onChange(next);
  };

  return (
    <Stack gap="sm" testID="load-destinations">
      <Subheader>{term('destination', 2)}</Subheader>
      {ids.length === 0 ? (
        <Text tone="muted">
          {t('forms.load.noDestinations', { destinations: term('destination', 2).toLowerCase() })}
        </Text>
      ) : null}
      {ids.map((id, index) => {
        const destination = byId.get(id);
        const name = destination?.name ?? id;
        return (
          <ListRow
            key={id}
            title={`${index + 1}. ${name}`}
            supporting={
              destination?.kind === 'altitude' ? formatDestination(destination) : undefined
            }
            trailing={
              <Row gap="xs">
                <IconButton
                  icon="arrow-up"
                  aria-label={t('forms.load.moveUp', { name })}
                  disabled={index === 0}
                  onPress={() => move(index, -1)}
                />
                <IconButton
                  icon="arrow-down"
                  aria-label={t('forms.load.moveDown', { name })}
                  disabled={index === ids.length - 1}
                  onPress={() => move(index, 1)}
                />
                <IconButton
                  icon="close"
                  aria-label={t('forms.load.removeDestination', { name })}
                  onPress={() => onChange(ids.filter((other) => other !== id))}
                />
              </Row>
            }
          />
        );
      })}
      <DestinationSelect
        label={t('forms.load.addDestination', { destination: term('destination').toLowerCase() })}
        exclude={ids}
        value={null}
        error={error}
        testID="load-destination-add"
        onChange={(id) => (id ? onChange([...ids, id]) : undefined)}
      />
    </Stack>
  );
}

export const DestinationListField = withHookForm(DestinationList);

export default DestinationListField;
