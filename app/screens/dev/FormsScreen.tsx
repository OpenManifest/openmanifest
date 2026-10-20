// Dev-only page (U2.2): the form components on the web, for the keyboard and accessibility specs (`@forms`). Not part of
// the product: the route exists outside production only and is replaced by the component gallery in U2.5.
import * as React from 'react';
import { ScrollView } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import {
  Chip,
  NumberField,
  Row,
  Segmented,
  Select,
  Stack,
  Switch,
  Text,
  TextField,
  useTheme,
} from 'app/ui';

const AIRCRAFT = [
  { value: 'caravan', label: 'Caravan' },
  { value: 'otter', label: 'Otter' },
  { value: 'skyvan', label: 'Skyvan' },
];
const THEME = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function FormsScreen() {
  const { colour } = useTheme();
  const [name, setName] = React.useState('');
  const [weight, setWeight] = React.useState<number | null>(80);
  const [aircraft, setAircraft] = React.useState<string | null>(null);
  const [scheme, setScheme] = React.useState<string | null>('system');
  const [alerts, setAlerts] = React.useState(false);
  const [filters, setFilters] = React.useState(['tandem']);
  const [people, setPeople] = React.useState(['Olive Owner', 'Jo Jumper']);

  return (
    <ScrollView
      style={{ backgroundColor: colour.app }}
      contentContainerStyle={{ padding: 16 }}
      testID="forms"
    >
      <Stack gap="xl">
        <Text variant="title" role="heading" aria-level={1}>
          Forms
        </Text>
        <TextField
          label="Name"
          value={name}
          onChange={setName}
          helperText="As on your licence"
          error={name === 'x' ? 'Too short' : null}
          testID="forms-name"
        />
        <NumberField
          label="Exit weight"
          unit="kg"
          min={30}
          max={200}
          step={0.5}
          value={weight}
          onChange={setWeight}
          testID="forms-weight"
        />
        <Select
          label="Aircraft"
          placeholder="Pick one"
          options={AIRCRAFT}
          value={aircraft}
          onChange={setAircraft}
          testID="forms-aircraft"
        />
        <Segmented label="Theme" options={THEME} value={scheme} onChange={setScheme} />
        <Switch label="Load alerts" value={alerts} onChange={setAlerts} testID="forms-alerts" />
        <Row gap="sm" wrap>
          {['tandem', 'student', 'coach'].map((id) => (
            <Chip
              key={id}
              label={id}
              selected={filters.includes(id)}
              onPress={() =>
                setFilters((current) =>
                  current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                )
              }
            />
          ))}
        </Row>
        <Row gap="sm" wrap>
          {people.map((person) => (
            <Chip
              key={person}
              variant="input"
              label={person}
              onRemove={() => setPeople((current) => current.filter((item) => item !== person))}
            />
          ))}
        </Row>
        <Text testID="forms-summary">{`${name}|${weight}|${aircraft}|${scheme}|${alerts}`}</Text>
      </Stack>
      <PortalHost />
    </ScrollView>
  );
}
