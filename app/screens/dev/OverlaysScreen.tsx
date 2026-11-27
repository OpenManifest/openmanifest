// Dev-only page (U2.3): the overlay components on the web, for the keyboard and accessibility specs (`@overlay`). Not
// part of the product: the route exists outside production only and is replaced by the component gallery in U2.5.
import * as React from 'react';
import { ScrollView } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { useNotifications } from 'app/providers/notifications';
import {
  Banner,
  Button,
  IconButton,
  Menu,
  Overlay,
  Popover,
  Row,
  Stack,
  Text,
  TextField,
  Tooltip,
  useTheme,
  type Presentation,
} from 'app/ui';

const KINDS: { presentation: Presentation; label: string }[] = [
  { presentation: 'auto', label: 'Open overlay' },
  { presentation: 'dialog', label: 'Open dialog' },
  { presentation: 'panel', label: 'Open panel' },
  { presentation: 'sheet', label: 'Open sheet' },
];

export default function OverlaysScreen() {
  const { colour } = useTheme();
  const notify = useNotifications();
  const [open, setOpen] = React.useState<Presentation | null>(null);
  const [name, setName] = React.useState('');
  const [chosen, setChosen] = React.useState('none');

  return (
    <ScrollView
      style={{ backgroundColor: colour.app }}
      contentContainerStyle={{ padding: 16 }}
      testID="overlays"
    >
      <Stack gap="xl">
        <Text variant="title" role="heading" aria-level={1}>
          Overlays
        </Text>

        <Row gap="sm" wrap>
          {KINDS.map(({ presentation, label }) => (
            <Button
              key={presentation}
              label={label}
              variant="secondary"
              onPress={() => setOpen(presentation)}
              testID={`open-${presentation}`}
            />
          ))}
        </Row>
        {KINDS.map(({ presentation }) => (
          <Overlay
            key={presentation}
            open={open === presentation}
            onClose={() => setOpen(null)}
            presentation={presentation}
            title="Edit load"
            testID={`overlay-${presentation}`}
            footer={
              <Row gap="sm" justify="end">
                <Button label="Cancel" variant="tertiary" onPress={() => setOpen(null)} />
                <Button
                  label="Save"
                  onPress={() => {
                    notify.success('Load saved');
                    setOpen(null);
                  }}
                />
              </Row>
            }
          >
            <TextField label="Load name" value={name} onChange={setName} />
          </Overlay>
        ))}

        <Row gap="md" align="center" wrap>
          <Menu
            label="More actions"
            items={[
              { label: 'Edit', icon: 'pencil', onPress: () => setChosen('edit') },
              { label: 'Duplicate', icon: 'content-copy', onPress: () => setChosen('duplicate') },
              {
                label: 'Archive',
                icon: 'archive',
                disabled: true,
                onPress: () => setChosen('archive'),
              },
              {
                label: 'Delete',
                icon: 'delete',
                destructive: true,
                onPress: () => setChosen('delete'),
              },
            ]}
          />
          <Popover
            label="Weather details"
            trigger={<Button label="Details" variant="secondary" testID="popover-trigger" />}
          >
            {(close) => (
              <Stack gap="md">
                <Text>Wind 8 kt from the west</Text>
                <Button label="Got it" onPress={close} />
              </Stack>
            )}
          </Popover>
          <Tooltip label="Open the settings">
            <IconButton icon="cog" aria-label="Settings" testID="tooltip-trigger" />
          </Tooltip>
          <Text testID="chosen">{`chosen: ${chosen}`}</Text>
        </Row>

        <Row gap="sm" wrap>
          <Button
            label="Success toast"
            variant="secondary"
            onPress={() => notify.success('Load saved')}
          />
          <Button
            label="Error toast"
            variant="secondary"
            onPress={() =>
              notify.error('Could not save', { label: 'Retry', onPress: () => setChosen('retry') })
            }
          />
        </Row>

        <Stack gap="xs">
          <Banner message="Winds are above the limit for tandems" tone="warning" />
          <Banner
            message="Your reserve repack is due"
            tone="info"
            action={{ label: 'Update', onPress: () => setChosen('update') }}
          />
          <Banner
            message="This load is closed"
            tone="blocked"
            onDismiss={() => setChosen('dismissed')}
          />
        </Stack>
      </Stack>
      <PortalHost />
    </ScrollView>
  );
}
