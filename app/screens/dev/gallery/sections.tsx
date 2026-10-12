import * as React from 'react';
import { View } from 'react-native';
import {
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  Countdown,
  Divider,
  EmptyState,
  IconButton,
  ListRow,
  Menu,
  NumberField,
  Overlay,
  Popover,
  ProgressMeter,
  Row,
  Segmented,
  Select,
  Skeleton,
  Stack,
  StatusBadge,
  Switch,
  Tabs,
  Text,
  TextField,
  Toast,
  Tooltip,
  type StatusKey,
  type TypeKey,
} from 'app/ui';
import Section, { State } from './Section';

const noop = () => undefined;

function TextSection() {
  const variants: TypeKey[] = ['countdown', 'title', 'body', 'bodyCompact', 'label', 'caption'];
  return (
    <Section id="text" title="Text">
      {variants.map((variant) => (
        <State key={variant} label={variant}>
          <Text variant={variant}>
            {variant === 'countdown' ? '12:34' : 'Jump run at 14:30, 9 of 14 slots'}
          </Text>
        </State>
      ))}
      <State label="tones">
        <Row gap="md" wrap>
          {(['default', 'muted', 'brand', 'warning', 'blocked', 'ok'] as const).map((tone) => (
            <Text key={tone} tone={tone}>
              {tone}
            </Text>
          ))}
        </Row>
      </State>
      <State label="tabular on / off">
        <Row gap="lg">
          <Text>1111 / 0000</Text>
          <Text tabular={false}>1111 / 0000</Text>
        </Row>
      </State>
    </Section>
  );
}

function ButtonSection() {
  return (
    <Section id="button" title="Button">
      {(['primary', 'secondary', 'tertiary', 'destructive'] as const).map((variant) => (
        <State key={variant} label={variant}>
          <Row gap="sm" wrap>
            <Button label="Save" variant={variant} onPress={noop} />
            <Button label="With icon" variant={variant} icon="plus" onPress={noop} />
            <Button label="Loading" variant={variant} loading onPress={noop} />
            <Button label="Disabled" variant={variant} disabled onPress={noop} />
          </Row>
        </State>
      ))}
    </Section>
  );
}

function IconButtonSection() {
  return (
    <Section id="icon-button" title="IconButton">
      <Row gap="sm" align="center" wrap>
        <IconButton icon="cog" aria-label="Settings" onPress={noop} />
        <IconButton icon="close" aria-label="Close" tone="muted" onPress={noop} />
        <IconButton icon="delete" aria-label="Delete" tone="blocked" onPress={noop} />
        <IconButton icon="plus" aria-label="Add" disabled onPress={noop} />
        <IconButton icon="close" size={16} dense aria-label="Remove" onPress={noop} />
      </Row>
    </Section>
  );
}

function ListRowSection() {
  return (
    <Section id="list-row" title="ListRow">
      <Card padding="none">
        <ListRow title="Plain row" />
        <Divider />
        <ListRow
          title="Olive Owner"
          supporting="Owner · 80 kg"
          leading={<Avatar name="Olive Owner" size="sm" />}
          trailing={<StatusBadge status="ok" label="Ready" />}
          onPress={noop}
        />
        <Divider />
        <ListRow title="Selected row" supporting="The current one" selected onPress={noop} />
        <Divider />
        <ListRow title="Disabled row" disabled onPress={noop} />
      </Card>
    </Section>
  );
}

function LayoutSection() {
  return (
    <Section id="layout" title="Card, Divider, Stack, Row">
      <State label="Card flat / raised">
        <Row gap="md" wrap>
          <Card>
            <Text>Flat</Text>
          </Card>
          <Card variant="raised">
            <Text>Raised</Text>
          </Card>
        </Row>
      </State>
      <State label="Divider">
        <Divider />
      </State>
      <State label="Row with gap md, Stack with gap xs">
        <Row gap="md">
          <Text>One</Text>
          <Text>Two</Text>
          <Stack gap="xs">
            <Text>Three</Text>
            <Text>Four</Text>
          </Stack>
        </Row>
      </State>
    </Section>
  );
}

const STATUSES: [StatusKey, string][] = [
  ['open', 'Open'],
  ['boarding', 'On call'],
  ['departed', 'In air'],
  ['landed', 'Landed'],
  ['cancelled', 'Cancelled'],
  ['warning', 'Warning'],
  ['blocked', 'Blocked'],
  ['ok', 'OK'],
  ['info', 'Info'],
];

function StatusBadgeSection() {
  return (
    <Section id="status-badge" title="StatusBadge">
      <Row gap="sm" wrap>
        {STATUSES.map(([status, label]) => (
          <StatusBadge key={status} status={status} label={label} />
        ))}
      </Row>
    </Section>
  );
}

function AvatarSection() {
  return (
    <Section id="avatar" title="Avatar">
      <Row gap="md" align="center">
        <Avatar name="Olive Owner" size="sm" />
        <Avatar name="Olive Owner" />
        <Avatar name="Olive Owner" size="lg" />
        <Avatar name="Cher" />
      </Row>
    </Section>
  );
}

function EmptyStateSection() {
  return (
    <Section id="empty-state" title="EmptyState">
      <View style={{ minHeight: 200 }}>
        <EmptyState
          icon="airplane"
          title="No loads so far today"
          body="Create the first one when the weather is right."
          action={{ label: 'New load', onPress: noop }}
        />
      </View>
    </Section>
  );
}

function CountdownSection() {
  const [end] = React.useState(() => new Date(Date.now() + 10 * 60_000));
  const [soon] = React.useState(() => new Date(Date.now() + 3 * 60_000));
  const [past] = React.useState(() => new Date(Date.now() - 1000));
  return (
    <Section id="countdown" title="Countdown">
      <Row gap="xl" wrap>
        <State label="10 minutes">
          <Countdown
            end={end}
            label="Boarding call"
            timeZone="Australia/Sydney"
            testID="gallery-clock-10"
          />
        </State>
        <State label="Under five minutes">
          <Countdown
            end={soon}
            label="Last call"
            timeZone="Australia/Sydney"
            testID="gallery-clock-3"
          />
        </State>
        <State label="Elapsed">
          <Countdown end={past} label="Departed" testID="gallery-clock-0" />
        </State>
      </Row>
    </Section>
  );
}

function TabsSection() {
  const [tab, setTab] = React.useState('jumps');
  return (
    <Section id="tabs" title="Tabs">
      <Tabs
        label="Profile sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'jumps', label: 'Jumps' },
          { value: 'gear', label: 'Gear' },
          { value: 'money', label: 'Money', disabled: true },
        ]}
      >
        <Text>{tab === 'jumps' ? 'The jumps panel' : 'The gear panel'}</Text>
      </Tabs>
    </Section>
  );
}

function SkeletonSection() {
  return (
    <Section id="skeleton" title="Skeleton">
      <Row gap="md" align="center">
        <Skeleton circle height={40} testID="gallery-skeleton-circle" />
        <View style={{ flex: 1 }}>
          <Skeleton lines={3} testID="gallery-skeleton-lines" />
        </View>
      </Row>
    </Section>
  );
}

function ProgressSection() {
  return (
    <Section id="progress" title="ProgressMeter">
      <ProgressMeter label="Slots filled" value={3} max={10} valueText="3 of 10" />
      <ProgressMeter label="Nearly full" value={9} max={10} valueText="9 of 10" tone="warning" />
      <ProgressMeter label="Full" value={10} max={10} valueText="Full" tone="blocked" />
      <ProgressMeter label="Upload" value={0.4} />
    </Section>
  );
}

function BannerSection() {
  return (
    <Section id="banner" title="Banner">
      <Banner
        message="Your reserve repack is due"
        tone="info"
        action={{ label: 'Update', onPress: noop }}
      />
      <Banner message="Winds are above the limit for tandems" tone="warning" />
      <Banner message="This load is closed" tone="blocked" onDismiss={noop} />
    </Section>
  );
}

function ToastSection() {
  return (
    <Section id="toast" title="Toast">
      <Toast message="Load saved" tone="success" onDismiss={noop} />
      <Toast message="Slot removed" action={{ label: 'Undo', onPress: noop }} onDismiss={noop} />
      <Toast
        message="Could not save"
        tone="error"
        action={{ label: 'Retry', onPress: noop }}
        onDismiss={noop}
      />
    </Section>
  );
}

function OverlaySection() {
  const [open, setOpen] = React.useState<'dialog' | 'panel' | 'sheet' | null>(null);
  return (
    <Section id="overlay" title="Overlay">
      <Row gap="sm" wrap>
        {(['dialog', 'panel', 'sheet'] as const).map((kind) => (
          <Button
            key={kind}
            label={`Open ${kind}`}
            variant="secondary"
            onPress={() => setOpen(kind)}
            testID={`gallery-open-${kind}`}
          />
        ))}
      </Row>
      {(['dialog', 'panel', 'sheet'] as const).map((kind) => (
        <Overlay
          key={kind}
          open={open === kind}
          onClose={() => setOpen(null)}
          presentation={kind}
          title="Edit load"
          footer={<Button label="Save" onPress={() => setOpen(null)} />}
        >
          <Text>The content of the {kind}.</Text>
        </Overlay>
      ))}
    </Section>
  );
}

function MenuSection() {
  return (
    <Section id="menu" title="Menu">
      <Menu
        label="More actions"
        items={[
          { label: 'Edit', icon: 'pencil', onPress: noop },
          { label: 'Archive', icon: 'archive', disabled: true, onPress: noop },
          { label: 'Delete', icon: 'delete', destructive: true, onPress: noop },
        ]}
      />
    </Section>
  );
}

function PopoverSection() {
  return (
    <Section id="popover" title="Popover">
      <Popover label="Weather details" trigger={<Button label="Details" variant="secondary" />}>
        {(close) => (
          <Stack gap="md">
            <Text>Wind 8 kt from the west</Text>
            <Button label="Got it" onPress={close} />
          </Stack>
        )}
      </Popover>
    </Section>
  );
}

function TooltipSection() {
  return (
    <Section id="tooltip" title="Tooltip">
      <Tooltip label="Open the settings">
        <IconButton icon="cog" aria-label="Settings" onPress={noop} />
      </Tooltip>
    </Section>
  );
}

function TextFieldSection() {
  const [value, setValue] = React.useState('Olive');
  return (
    <Section id="text-field" title="TextField">
      <TextField label="Name" value={value} onChange={setValue} />
      <TextField
        label="With helper"
        value=""
        onChange={noop}
        helperText="As on your licence"
        placeholder="Full name"
      />
      <TextField label="With error" value="x" onChange={noop} error="Too short" />
      <TextField label="Disabled" value="Locked" disabled />
      <TextField label="Weight" value="80" suffix="kg" onChange={noop} />
      <TextField label="Notes" value="" onChange={noop} multiline />
    </Section>
  );
}

function NumberFieldSection() {
  const [weight, setWeight] = React.useState<number | null>(80);
  return (
    <Section id="number-field" title="NumberField">
      <NumberField
        label="Exit weight"
        unit="kg"
        min={30}
        max={200}
        step={0.5}
        value={weight}
        onChange={setWeight}
      />
      <NumberField label="At the minimum" value={30} min={30} max={200} unit="kg" />
      <NumberField label="With error" value={500} max={200} error="Too heavy" />
      <NumberField label="Without buttons" value={12} hideSteppers />
      <NumberField label="Disabled" value={12} disabled />
    </Section>
  );
}

const AIRCRAFT = [
  { value: 'caravan', label: 'Caravan' },
  { value: 'otter', label: 'Otter' },
  { value: 'skyvan', label: 'Skyvan', disabled: true },
];

function SelectSection() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <Section id="select" title="Select">
      <Select
        label="Aircraft"
        placeholder="Pick one"
        options={AIRCRAFT}
        value={value}
        onChange={setValue}
      />
      <Select label="Chosen" options={AIRCRAFT} value="otter" />
      <Select
        label="With error"
        options={AIRCRAFT}
        value={null}
        placeholder="Pick one"
        error="Required"
      />
      <Select label="Disabled" options={AIRCRAFT} value="caravan" disabled />
    </Section>
  );
}

function SegmentedSection() {
  const [value, setValue] = React.useState<string | null>('system');
  const options = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];
  return (
    <Section id="segmented" title="Segmented">
      <Segmented label="Appearance" options={options} value={value} onChange={setValue} />
      <Segmented label="With error" options={options} value={null} error="Choose one" />
      <Segmented label="Disabled" options={options} value="dark" disabled />
    </Section>
  );
}

function SwitchSection() {
  const [on, setOn] = React.useState(true);
  return (
    <Section id="switch" title="Switch">
      <Switch label="Load alerts" value={on} onChange={setOn} />
      <Switch
        label="Off"
        value={false}
        onChange={noop}
        helperText="Tell me when a load is on call"
      />
      <Switch label="With error" value={false} error="You must accept" />
      <Switch label="Disabled" value disabled />
    </Section>
  );
}

function ChipSection() {
  const [filters, setFilters] = React.useState(['tandem']);
  const [people, setPeople] = React.useState(['Olive Owner', 'Jo Jumper']);
  return (
    <Section id="chip" title="Chip">
      <State label="filter">
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
          <Chip label="disabled" disabled />
        </Row>
      </State>
      <State label="input">
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
      </State>
    </Section>
  );
}

/** Every component of `app/ui`, in the order of the gallery; `id` is the `?section=` and the `gallery-<id>` test id */
export const SECTIONS: { id: string; title: string; Component: React.ComponentType }[] = [
  { id: 'text', title: 'Text', Component: TextSection },
  { id: 'button', title: 'Button', Component: ButtonSection },
  { id: 'icon-button', title: 'IconButton', Component: IconButtonSection },
  { id: 'list-row', title: 'ListRow', Component: ListRowSection },
  { id: 'layout', title: 'Card, Divider, Stack, Row', Component: LayoutSection },
  { id: 'status-badge', title: 'StatusBadge', Component: StatusBadgeSection },
  { id: 'avatar', title: 'Avatar', Component: AvatarSection },
  { id: 'empty-state', title: 'EmptyState', Component: EmptyStateSection },
  { id: 'countdown', title: 'Countdown', Component: CountdownSection },
  { id: 'tabs', title: 'Tabs', Component: TabsSection },
  { id: 'skeleton', title: 'Skeleton', Component: SkeletonSection },
  { id: 'progress', title: 'ProgressMeter', Component: ProgressSection },
  { id: 'banner', title: 'Banner', Component: BannerSection },
  { id: 'toast', title: 'Toast', Component: ToastSection },
  { id: 'overlay', title: 'Overlay', Component: OverlaySection },
  { id: 'menu', title: 'Menu', Component: MenuSection },
  { id: 'popover', title: 'Popover', Component: PopoverSection },
  { id: 'tooltip', title: 'Tooltip', Component: TooltipSection },
  { id: 'text-field', title: 'TextField', Component: TextFieldSection },
  { id: 'number-field', title: 'NumberField', Component: NumberFieldSection },
  { id: 'select', title: 'Select', Component: SelectSection },
  { id: 'segmented', title: 'Segmented', Component: SegmentedSection },
  { id: 'switch', title: 'Switch', Component: SwitchSection },
  { id: 'chip', title: 'Chip', Component: ChipSection },
];
