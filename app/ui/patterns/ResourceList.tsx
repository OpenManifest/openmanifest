import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import Tappable from '../Tappable';
import Button from '../components/Button';
import Icon from '../components/Icon';
import type { IconName } from '../components/IconButton';
import { Row, Stack } from '../components/Stack';
import Text from '../components/Text';
import EmptyState from '../components/display/EmptyState';
import Skeleton from '../components/display/Skeleton';
import { useTheme } from '../theme';

/** A labelled value on a row of a setup list ("Registration VH-ABC", "Price $30.00") */
export type ResourceFact = { label: string; value: string };

export type ResourceListProps<T> = {
  items: readonly T[];
  keyOf(item: T): string;
  titleOf(item: T): string;
  /** What the row says about the item under its title */
  factsOf?(item: T): ResourceFact[];
  iconOf?(item: T): IconName;
  /** A control beside the row (a switch): it sits outside the row's button */
  trailingOf?(item: T): React.ReactNode;
  /** Opens the item's form; without it the rows are plain content */
  onOpen?(item: T): void;
  /** Waiting for the first answer: a placeholder stands in for the rows */
  loading?: boolean;
  /** Pull to refresh */
  onRefresh?(): void;
  /** The button that adds an item; left out when the person may not */
  create?: { label: string; onPress(): void; testID?: string };
  /** What the screen says when there is nothing yet */
  empty: { title: string; body?: string; icon?: IconName };
  /** A line above the list on what it is for */
  intro?: string;
  testID?: string;
  rowTestID?(item: T): string;
  /** Rendered after the list: the forms it opens */
  children?: React.ReactNode;
};

const MAX_WIDTH = 720;

function Facts({ facts }: { facts: ResourceFact[] }) {
  if (!facts.length) return null;
  return (
    <Row gap="md" wrap>
      {facts.map((fact) => (
        <Row key={fact.label} gap="xs" align="baseline">
          <Text variant="caption" tone="muted">
            {fact.label}
          </Text>
          <Text variant="caption">{fact.value}</Text>
        </Row>
      ))}
    </Row>
  );
}

/**
 * The list of a setup screen (vehicles, tickets, crew roles…): a button to add one, then one row per item with its
 * name and a few labelled facts. A row opens the item's form (`ResourceForm`); an empty list says what to add.
 */
export default function ResourceList<T>({
  items,
  keyOf,
  titleOf,
  factsOf,
  iconOf,
  trailingOf,
  onOpen,
  loading = false,
  onRefresh,
  create,
  empty,
  intro,
  testID,
  rowTestID,
  children,
}: ResourceListProps<T>) {
  const theme = useTheme();
  const waiting = loading && !items.length;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        width: '100%',
        maxWidth: MAX_WIDTH,
        alignSelf: 'center',
        padding: theme.space.lg,
        gap: theme.space.md,
      }}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={loading} onRefresh={onRefresh} /> : undefined
      }
    >
      {intro || (create && items.length) ? (
        <Row gap="md" align="center" justify="between" wrap>
          <Stack flex>{intro ? <Text tone="muted">{intro}</Text> : null}</Stack>
          {create && items.length ? (
            <Button
              label={create.label}
              icon="plus"
              onPress={create.onPress}
              testID={create.testID}
            />
          ) : null}
        </Row>
      ) : null}
      {waiting ? <Skeleton lines={3} /> : null}
      {!waiting && !items.length ? (
        <EmptyState
          testID={testID ? `${testID}-empty` : undefined}
          icon={empty.icon}
          title={empty.title}
          body={empty.body}
          action={create ? { label: create.label, onPress: create.onPress } : undefined}
        />
      ) : null}
      {items.length ? (
        <View
          testID={testID}
          style={{
            backgroundColor: theme.colour.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colour.border,
            overflow: 'hidden',
          }}
        >
          {items.map((item, index) => {
            const title = titleOf(item);
            const content = (
              <>
                {iconOf ? <Icon name={iconOf(item)} /> : null}
                <Stack flex gap="xs">
                  <Text variant="body" numberOfLines={1}>
                    {title}
                  </Text>
                  <Facts facts={factsOf?.(item) ?? []} />
                </Stack>
              </>
            );
            const row = {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.md,
              minHeight: theme.density.row,
              paddingVertical: theme.space.sm,
              paddingHorizontal: theme.space.lg,
            } as const;
            const trailing = trailingOf?.(item);
            return (
              <View
                key={keyOf(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: index ? 1 : 0,
                  borderTopColor: theme.colour.border,
                }}
              >
                {onOpen ? (
                  <Tappable
                    role="button"
                    aria-label={title}
                    testID={rowTestID?.(item)}
                    minTarget={false}
                    onPress={() => onOpen(item)}
                    style={({ pressed, hovered }) => ({
                      ...row,
                      backgroundColor: pressed || hovered ? theme.colour.raised : 'transparent',
                    })}
                  >
                    {content}
                  </Tappable>
                ) : (
                  <View testID={rowTestID?.(item)} style={row}>
                    {content}
                  </View>
                )}
                {trailing ? <View style={{ paddingEnd: theme.space.md }}>{trailing}</View> : null}
              </View>
            );
          })}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}
