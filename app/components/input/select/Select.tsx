import * as React from 'react';
import { List, Menu, Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import UserAvatar from 'app/components/UserAvatar';

export interface ISelectOption<T> {
  label: string;
  value: T;
  icon?: React.ReactElement;
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
    <Menu.Item
      key={`select-option-${item?.label}`}
      onPress={openMenu}
      title={item?.label}
      icon="chevron-down"
      style={{ width: '100%' }}
    />
  );
}

export default function Select<T>(props: ISelectProps<T>) {
  const { label, options, onChange, value, renderAnchor } = props;
  const [visible, setVisible] = React.useState<boolean>(false);

  const onDismiss = React.useCallback(() => {
    setVisible(false);
  }, []);

  const onOpen = React.useCallback(() => {
    setVisible(true);
  }, []);

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
      <Menu
        {...{ visible, onDismiss, anchor }}
        style={{ zIndex: 10000 }}
        contentStyle={{ zIndex: 10000 }}
      >
        {options?.map((option) => (
          <Menu.Item
            key={`select-option-${option.label}`}
            onPress={createSelectHandler(option)}
            style={{ height: 36, marginLeft: 0, marginRight: 0 }}
            title={option.label}
            {...(!showAvatars
              ? {}
              : {
                  titleStyle: styles.menuItemTitle,
                  title: (
                    <>
                      <UserAvatar
                        name={option?.label}
                        image={option?.avatar || undefined}
                        size={24}
                      />
                      <Text>{option?.label}</Text>
                    </>
                  ),
                })}
          />
        ))}
      </Menu>
    </>
  );
}

const styles = StyleSheet.create({
  menuItemTitle: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
});
