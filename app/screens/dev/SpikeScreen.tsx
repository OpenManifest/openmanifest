// Dev-only spike (U0.8): @rn-primitives overlays on the web, to judge their keyboard and screen reader behaviour.
// Not part of the product: the route exists outside production only (app/screens/routes.tsx) and is removed with U2.3.
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Dialog from '@rn-primitives/dialog';
import * as Popover from '@rn-primitives/popover';
import { PortalHost } from '@rn-primitives/portal';
import * as Select from '@rn-primitives/select';
import * as Tabs from '@rn-primitives/tabs';
import * as Tooltip from '@rn-primitives/tooltip';

const box = {
  padding: 12,
  borderWidth: 1,
  borderColor: '#555555',
  borderRadius: 8,
  backgroundColor: '#FFFFFF',
};
const button = { padding: 12, borderRadius: 8, backgroundColor: '#1D3557' };
const label = { color: '#FFFFFF', fontWeight: '600' } as const;
const FRUIT = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

export default function SpikeScreen() {
  const [tab, setTab] = React.useState('one');
  const [fruit, setFruit] = React.useState<Select.Option>(undefined);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }} testID="spike">
      <Text
        role="heading"
        aria-level={1}
        style={{ fontSize: 20, fontWeight: '600', color: '#14181F' }}
      >
        Primitives spike
      </Text>

      <View style={{ gap: 8 }}>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Pressable role="button" style={button} testID="dialog-trigger">
              <Text style={label}>Open dialog</Text>
            </Pressable>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay
              style={{ position: 'absolute', inset: 0, backgroundColor: '#000000' }}
            />
            <Dialog.Content
              style={{ ...box, alignSelf: 'center', marginTop: 120, gap: 12, width: 320 }}
            >
              <Dialog.Title style={{ fontSize: 18, fontWeight: '600', color: '#14181F' }}>
                Dialog title
              </Dialog.Title>
              <Dialog.Description style={{ color: '#14181F' }}>
                Dialog description
              </Dialog.Description>
              <Pressable role="button" style={button} testID="dialog-inner-action">
                <Text style={label}>Inner action</Text>
              </Pressable>
              <Dialog.Close asChild>
                <Pressable role="button" style={button} testID="dialog-close">
                  <Text style={label}>Close dialog</Text>
                </Pressable>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </View>

      <View style={{ gap: 8 }}>
        <Select.Root value={fruit} onValueChange={setFruit}>
          <Select.Trigger asChild>
            <Pressable role="combobox" aria-label="Fruit" style={box} testID="select-trigger">
              <Select.Value placeholder="Pick a fruit" style={{ color: '#14181F' }} />
            </Pressable>
          </Select.Trigger>
          <Select.Portal>
            <Select.Overlay>
              <Select.Content style={{ ...box, minWidth: 200 }}>
                <Select.Viewport>
                  {FRUIT.map((item) => (
                    <Select.Item
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      style={{ padding: 8 }}
                    >
                      <Select.ItemText style={{ color: '#14181F' }} />
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Overlay>
          </Select.Portal>
        </Select.Root>
      </View>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List style={{ flexDirection: 'row', gap: 8 }}>
          <Tabs.Trigger value="one" style={box}>
            <Text style={{ color: '#14181F' }}>Tab one</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="two" style={box}>
            <Text style={{ color: '#14181F' }}>Tab two</Text>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one" style={{ paddingTop: 8 }}>
          <Text style={{ color: '#14181F' }}>Panel one</Text>
        </Tabs.Content>
        <Tabs.Content value="two" style={{ paddingTop: 8 }}>
          <Text style={{ color: '#14181F' }}>Panel two</Text>
        </Tabs.Content>
      </Tabs.Root>

      <View style={{ gap: 8 }}>
        <Popover.Root>
          <Popover.Trigger asChild>
            <Pressable role="button" style={button} testID="popover-trigger">
              <Text style={label}>Open popover</Text>
            </Pressable>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content style={box}>
              <Text style={{ color: '#14181F' }}>Popover content</Text>
              <Popover.Close asChild>
                <Pressable role="button" style={button} testID="popover-close">
                  <Text style={label}>Close popover</Text>
                </Pressable>
              </Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </View>

      <View style={{ gap: 8 }}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Pressable role="button" style={button} testID="tooltip-trigger">
              <Text style={label}>Hover or focus me</Text>
            </Pressable>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content style={box}>
              <Text style={{ color: '#14181F' }}>Tooltip text</Text>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </View>
      <PortalHost />
    </ScrollView>
  );
}
