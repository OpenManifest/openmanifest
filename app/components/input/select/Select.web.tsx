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
import { isEqual } from 'lodash';

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
  compare?(a: T | null | undefined, b: T | null | undefined): boolean;
  renderAnchor?: React.FC<IAnchorProps<T>>;
}

interface IAnchorProps<T> {
  item?: ISelectOption<T>;
  openMenu(): void;
}

type Extract<T> = T extends React.ComponentType<infer P> ? P : unknown;
type AllowedIcons = Extract<typeof MaterialCommunityIcons>['name'];

export default function Select<T>(props: ISelectProps<T>) {
  const {
    label,
    error,
    compare = isEqual,
    options,
    renderAnchor,
    onChange,
    value,
    helperText,
  } = props;
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
    () => options.find((option) => compare(option.value, value)),
    [compare, options, value]
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
                  {typeof icon === 'string' ? (
                    <MaterialCommunityIcons icon={icon as AllowedIcons} size={24} />
                  ) : null}
                  {React.isValidElement(icon) && typeof icon !== 'string' ? icon : null}
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
        variant="standard"
        error={!!error}
        style={{ paddingTop: 0 }}
        SelectDisplayProps={{
          style: { display: 'inline-flex', alignItems: 'center' },
        }}
        onChange={({ target }) => onChange(target.value as T)}
      >
        {options?.map(({ value: val, icon, avatar, label: title }) => (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <MuiMenuItem value={val as T}>
            {!icon || avatar ? null : (
              <ListItemIcon>
                {typeof icon === 'string' ? (
                  <MaterialCommunityIcons icon={icon as AllowedIcons} size={24} />
                ) : null}
                {React.isValidElement(icon) && typeof icon !== 'string' ? icon : null}
              </ListItemIcon>
            )}
            {!avatar || !showAvatars ? null : (
              <ListItemAvatar>
                <UserAvatar name={label} image={avatar} size={32} />
              </ListItemAvatar>
            )}
            <ListItemText primary={title} />
          </MuiMenuItem>
        ))}
      </MuiSelect>
      <FormHelperText error={!!error}>{error || helperText}</FormHelperText>
    </FormControl>
  );
}
