import * as React from 'react';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import MuiSelect from '@mui/material/Select';
import MuiMenuItem from '@mui/material/MenuItem';
import {
  FormControl,
  InputLabel,
  FormHelperText,
  ListItemIcon,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserAvatar from 'app/components/UserAvatar';
import Menu from 'app/components/popover/Menu';

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

export default function Select<T>(props: ISelectProps<T>) {
  const { label, error, options, renderAnchor, onChange, value, helperText } = props;
  const [open, setOpen] = React.useState<boolean>(false);

  const onOpen = React.useCallback(() => {
    if (!options?.length) {
      return;
    }
    setOpen(true);
  }, [options?.length]);
  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, []);

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const createSelectHandler = React.useCallback(
    (option: ISelectOption<T>) => () => {
      onDismiss();
      onChange(option.value);
    },
    [onChange, onDismiss]
  );
  const showAvatars = React.useMemo(() => options?.some((option) => option.avatar), [options]);

  const anchor = React.useMemo(
    () =>
      typeof renderAnchor === 'function'
        ? (renderAnchor as Function)({ item: selectedOption, openMenu: onOpen })
        : null,
    [onOpen, renderAnchor, selectedOption]
  );

  if (renderAnchor) {
    return (
      <Menu {...{ anchor, open, setOpen }}>
        {options?.map((option) => {
          const { icon, avatar, label: title } = option;

          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <MuiMenuItem onClick={createSelectHandler(option)}>
              {!icon || avatar ? null : (
                <ListItemIcon>
                  {typeof icon === 'string' ? <MaterialCommunityIcons icon={icon} /> : icon}
                </ListItemIcon>
              )}
              {!avatar || !showAvatars ? null : (
                <ListItemAvatar>
                  <UserAvatar name={label} image={avatar} size={32} />
                </ListItemAvatar>
              )}

              <ListItemText>{title}</ListItemText>
            </MuiMenuItem>
          );
        })}
      </Menu>
    );
  }

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="demo-simple-select-helper-label">{label}</InputLabel>
      <MuiSelect
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={selectedOption?.value}
        {...{ label }}
        error={!!error}
        onChange={({ target }) => onChange(target.value as T)}
      >
        {options?.map(({ value: val, icon, avatar, label: title }) => (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <MuiMenuItem value={val as T}>
            {!icon || avatar ? null : (
              <ListItemIcon>
                {typeof icon === 'string' ? <MaterialCommunityIcons icon={icon} /> : icon}
              </ListItemIcon>
            )}
            {!avatar || !showAvatars ? null : (
              <ListItemAvatar>
                <UserAvatar name={label} image={avatar} size={32} />
              </ListItemAvatar>
            )}

            <ListItemText>{title}</ListItemText>
          </MuiMenuItem>
        ))}
      </MuiSelect>
      <FormHelperText error={!!error}>{error || helperText}</FormHelperText>
    </FormControl>
  );
}
