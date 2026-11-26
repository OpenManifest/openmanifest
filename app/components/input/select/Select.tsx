import * as React from 'react';
import { isEqual } from 'lodash';
import { Avatar, Menu, Select as UiSelect, Stack, Text, type IconName } from 'app/ui';

export interface ISelectOption<T> {
  label: string;
  value: T;
  /** A MaterialCommunityIcons name, shown before the label in the menu */
  icon?: IconName;
  /** A photo, shown before the label in the menu */
  avatar?: string | null;
}

interface ISelectProps<T> {
  label?: string;
  error?: string | null;
  helperText?: string;
  options: ISelectOption<T>[];
  value?: T | null;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
  onChange(item: T): void;

  // Custom comparison function for option and selected value
  compare?(a: T | null | undefined, b: T | null | undefined): boolean;
  // Replaces the select field: the anchor is what opens the menu (a chip in a load card)
  renderAnchor?: React.FC<IAnchorProps<T>>;
}

interface IAnchorProps<T> {
  item?: ISelectOption<T>;
  openMenu(): void;
}

/**
 * One choice from many, for values of any type. Without `renderAnchor` it is the select field of `app/ui` (a combobox
 * with a list); with it, the anchor you draw opens a menu of the options next to it.
 */
export default function Select<T>({
  label,
  error,
  helperText,
  options,
  value,
  placeholder,
  disabled,
  testID,
  onChange,
  compare = isEqual,
  renderAnchor,
}: ISelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const selectedIndex = options.findIndex((option) => compare(option.value, value));

  if (!renderAnchor) {
    return (
      <UiSelect
        label={label ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        testID={testID}
        error={error}
        helperText={helperText}
        // The options are keyed by their position: the values can be anything
        options={options.map((option, index) => ({ value: String(index), label: option.label }))}
        value={selectedIndex >= 0 ? String(selectedIndex) : null}
        onChange={(key) => onChange(options[Number(key)].value)}
      />
    );
  }

  const selected = options[selectedIndex];
  const Anchor = renderAnchor;
  return (
    <Stack gap="xs">
      <Menu
        label={label ?? ''}
        open={open}
        onOpenChange={setOpen}
        testID={testID}
        anchor={
          <Anchor item={selected} openMenu={() => (options.length ? setOpen(true) : undefined)} />
        }
        items={options.map((option, index) => ({
          label: option.label,
          icon: option.icon,
          leading: option.avatar ? (
            <Avatar name={option.label} imageUri={option.avatar} size="sm" />
          ) : undefined,
          selected: index === selectedIndex,
          onPress: () => onChange(option.value),
        }))}
      />
      {error ? (
        <Text variant="caption" tone="blocked" role="alert">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
