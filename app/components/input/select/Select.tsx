import * as React from 'react';
import { List } from 'react-native-paper';
import Menu, { MenuItem } from 'app/components/popover/Menu';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

export interface ISelectOption<T> {
  label: string;
  value: T;
  icon?: IconSource;
  avatar?: string | null;
}
interface ISelectProps<T> {
  label?: string;
  error?: string | null;
  helperText?: string;
  options: ISelectOption<T>[];
  value?: T | null;
  onChange(item: T): void;
  renderAnchor?: React.FC<IAnchorProps<T>>;
}

interface IAnchorProps<T> {
  item?: ISelectOption<T>;
  openMenu(): void;
}

function Anchor<T>(props: IAnchorProps<T>): JSX.Element {
  const { item, openMenu } = props;
  return (
    <MenuItem
      key={`select-option-${item?.label}`}
      onPress={openMenu}
      title={item?.label}
      icon="chevron-down"
    />
  );
}

export default function Select<T>(props: ISelectProps<T>) {
  const { label, options, onChange, value, renderAnchor } = props;
  const [open, setOpen] = React.useState<boolean>(false);

  console.log('Select menu', open);
  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, []);

  const onOpen = React.useCallback(() => {
    if (!options?.length) {
      return;
    }
    setOpen(true);
  }, [options?.length]);

  const createSelectHandler = React.useCallback(
    (option: ISelectOption<T>) => () => {
      onDismiss();
      onChange(option.value);
    },
    [onChange, onDismiss]
  );

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const anchor = React.useMemo(
    () =>
      typeof renderAnchor === 'function' ? (
        (renderAnchor as Function)({ item: selectedOption, openMenu: onOpen })
      ) : (
        <Anchor item={selectedOption} openMenu={onOpen} />
      ),
    [onOpen, renderAnchor, selectedOption]
  );

  const showAvatars = React.useMemo(() => options?.some((option) => option.avatar), [options]);

  return (
    <>
      {label ? <List.Subheader>{label}</List.Subheader> : null}
      <Menu {...{ open, setOpen, anchor }}>
        {options?.map((option) => (
          <MenuItem
            key={`select-option-${option.label}`}
            onPress={createSelectHandler(option)}
            title={option.label || ''}
            icon={option.icon}
            {...(!showAvatars
              ? {}
              : {
                  avatar: { name: option.label || '', image: option.avatar || undefined },
                })}
          />
        ))}
      </Menu>
    </>
  );
}
